# Deploy — Printly

Guia real pra subir front (este repo), backend e MySQL numa VPS **dedicada só ao Printly** (nada compartilhado), usando Docker + Caddy (HTTPS automático via Let's Encrypt, sem configuração manual de certificado).

Domínios: `printly.app.br` (front) e `api.printly.app.br` (back).

## 0. Acesso SSH inicial

```bash
ssh root@SEU_IP_VPS
```

Se a VPS veio só com acesso root por senha, crie um usuário não-root com sudo (opcional, mas recomendado) e copie sua chave pra ele:

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Dali em diante, `ssh deploy@SEU_IP_VPS`.

## 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# saia e entre de novo no SSH pra aplicar o grupo (ou rode `newgrp docker`)
```

Firewall básico (se o provedor não cuidar disso):

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 2. DNS

`printly.app.br` é domínio próprio (registro.br, extensão `.app.br`), não subdomínio de outro domínio — registre-o lá se ainda não tiver. Depois, no painel do domínio → Editar Zona DNS, cria (ou atualiza, se for migração de outra VPS) 2 registros tipo **A**, apontando pro IP da VPS:

| Nome | Tipo | Valor |
|---|---|---|
| `@` (raiz) | A | `SEU_IP_VPS` |
| `api` | A | `SEU_IP_VPS` |

Propagação pode levar de minutos a algumas horas.

## 3. Clonar os repos e montar o compose

```bash
mkdir -p ~/printly && cd ~/printly
git clone https://github.com/natanD1/printlyBack.git back
git clone https://github.com/natanD1/printly.git front
```

`~/printly/.env` (senha só com letras/números — senha com `\`, `@`, `=`, `;` quebra o parser de connection string do MySqlConnector):

```bash
cat > ~/printly/.env << 'EOF'
MYSQL_ROOT_PASSWORD=<openssl rand -hex 24>
JWT_SECRET=<openssl rand -base64 32>
EOF
```

`~/printly/Caddyfile`:

```
printly.app.br {
    reverse_proxy printly-frontend:3000
}

api.printly.app.br {
    reverse_proxy printly-backend:8080
}
```

`~/printly/docker-compose.yml`:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: printly_db
    volumes:
      - mysql_data:/var/lib/mysql
    # sem "ports:" — só acessível dentro da rede do compose

  printly-backend:
    build: ./back
    restart: unless-stopped
    environment:
      ConnectionStrings__DefaultConnection: "Server=mysql;Port=3306;Database=printly_db;User=root;Password=${MYSQL_ROOT_PASSWORD};"
      Jwt__Secret: ${JWT_SECRET}
      Jwt__Issuer: Printly.WebApi
      Jwt__Audience: Printly.Client
      Jwt__ExpirationMinutes: "60"
    depends_on:
      - mysql

  printly-frontend:
    build: ./front
    restart: unless-stopped
    environment:
      API_URL: http://printly-backend:8080
      NODE_ENV: production
    depends_on:
      - printly-backend

volumes:
  mysql_data:
  caddy_data:
  caddy_config:
```

Sem `ports:` nem labels de proxy nos serviços `printly-*` — o Caddy fala com eles pelo nome do serviço na rede padrão do compose (DNS interno do Docker), e é o único container que expõe 80/443 pro mundo. `API_URL` usa `http://printly-backend:8080` — nome do serviço — e `frontend`/`backend` falam entre si só pela rede interna, nunca pelo domínio público (mesmo desenho de "dupla camada" do `CLAUDE.md`: o browser nunca fala direto com a API).

Subir:

```bash
cd ~/printly
docker compose --env-file .env up -d --build
```

Acompanhe os logs do Caddy pra confirmar que o certificado saiu (pode levar uns 30s-1min na primeira vez):

```bash
docker compose logs -f caddy
```

## 4. Aplicar as migrations (schema do banco)

A imagem de runtime do backend só tem o binário publicado (sem `dotnet-ef`). Roda um container temporário com o SDK, na mesma rede do compose, falando com o `mysql` direto pelo nome interno — sem expor porta nenhuma:

```bash
cat > ~/printly/migrate.sh << 'EOF'
#!/bin/bash
set -e
dotnet tool install --global dotnet-ef
export PATH="$PATH:/root/.dotnet/tools"
dotnet restore Printly.sln
dotnet ef database update \
  --project src/Printly.Infrastructure \
  --startup-project src/Printly.WebApi
EOF

source ~/printly/.env

docker run --rm -it \
  --network printly_default \
  -v ~/printly/back:/src \
  -v ~/printly/migrate.sh:/migrate.sh \
  -w /src \
  -e ConnectionStrings__DefaultConnection="Server=mysql;Port=3306;Database=printly_db;User=root;Password=${MYSQL_ROOT_PASSWORD};" \
  -e Jwt__Secret="${JWT_SECRET}" \
  -e Jwt__Issuer='Printly.WebApi' \
  -e Jwt__Audience='Printly.Client' \
  -e Jwt__ExpirationMinutes='60' \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  bash /migrate.sh
```

### Primeiro convite / primeiro admin

Não tem seed — o cadastro exige um código de convite válido, e virar admin exige `UPDATE` manual. Faz assim uma vez:

```bash
docker exec -i printly-mysql-1 mysql -uroot -p"$MYSQL_ROOT_PASSWORD" printly_db -e "INSERT INTO invite_codes (Id, Code, Status, ExpiresAt, GeneratedByUserId, UsedByUserId, UsedAt, RevokedAt, CreatedAt, UpdatedAt) VALUES (UUID(), 'BOOTSTRAP001', 'Available', DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, NULL, NULL, NULL, NOW(), NULL);"
```

Cadastra pelo site usando `BOOTSTRAP001`, depois:

```bash
docker exec -i printly-mysql-1 mysql -uroot -p"$MYSQL_ROOT_PASSWORD" printly_db -e "UPDATE users SET IsAdmin = 1 WHERE Email = 'seu-email';"
```

Loga de novo (token novo com a claim de admin).

### Marcas de filamento

Seed com as marcas já cadastradas localmente (nome + imagem em base64), em `back/seeds/filaments-brands-seed.sql`. `INSERT IGNORE` — rodar mais de uma vez não duplica.

```bash
docker exec -i printly-mysql-1 mysql -uroot -p"$MYSQL_ROOT_PASSWORD" printly_db < ~/printly/back/seeds/filaments-brands-seed.sql
```

Pra atualizar depois de cadastrar/editar marcas localmente, regenerar o arquivo:

```bash
mysqldump -h 127.0.0.1 -P 3306 -u root -p'SUA_SENHA_LOCAL' \
  --no-create-info --skip-triggers --complete-insert --skip-comments --set-gtid-purged=OFF \
  printly_db filaments_brands 2>/dev/null > back/seeds/filaments-brands-seed.sql
sed -i '' 's/^INSERT INTO `filaments_brands`/INSERT IGNORE INTO `filaments_brands`/' back/seeds/filaments-brands-seed.sql
```

## 5. Redeploy depois de mudar código

```bash
cd ~/printly/front && git pull   # ou back
cd ~/printly
docker compose --env-file .env up -d --build printly-frontend   # ou printly-backend
```

## 6. Acessar o MySQL de produção com um client gráfico (Workbench etc)

Nunca expor 3306 pro mundo. Publica só em loopback e usa túnel SSH:

```yaml
# no serviço mysql do docker-compose.yml, temporariamente:
    ports:
      - "127.0.0.1:3308:3306"
```
```bash
docker compose --env-file .env up -d mysql
```
Na sua máquina:
```bash
ssh -L 3308:localhost:3308 usuario@SEU_IP_VPS -N
```
Conecta o client em `127.0.0.1:3308`. Remove a porta do compose depois de usar.

## Checklist rápido

- [ ] Docker instalado na VPS, usuário no grupo `docker`
- [ ] Firewall liberando só 22/80/443
- [ ] Domínio `printly.app.br` registrado e registros A (`@` e `api`) apontando pro IP da VPS
- [ ] `.env` com senha só alfanumérica (sem `\`, `@`, `=`, `;`)
- [ ] `docker compose up -d --build` rodando os 4 serviços (`caddy`, `mysql`, `printly-backend`, `printly-frontend`)
- [ ] Certificado emitido automaticamente pelo Caddy (confirmar nos logs)
- [ ] Migrations aplicadas via container SDK temporário (sem expor porta do banco)
- [ ] Seed de marcas de filamento aplicado
- [ ] Convite bootstrap criado + primeiro usuário promovido a admin
- [ ] 3306 nunca exposto publicamente (só túnel SSH quando precisar)
