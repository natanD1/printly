---
name: product-pricing
description: Fórmula do preço automático de produtos (custo, preço sugerido, lote, printRuns, depreciação/manutenção/falha da impressora). Use ao mexer em produto, formulário/detalhe de produto, impressora ou configurações de kWh.
---

## Cálculo automático de preço (produtos)

`Product.costPrice`/`salePrice` **não são digitados** — o backend calcula sozinho a cada `POST`/`PUT /products` (`ProductPricingCalculator`, `Printly.Application`). Todo produto novo/editado exige uma **impressora** (`printerId`, backend responde 400 "Selecione uma impressora." sem ela): potência, depreciação, manutenção, falha e margem vêm dela (`Printer`); só o `kwhPrice` vem de `UserSettings`. Produtos anteriores ao módulo têm `printerId = null` e mantêm o preço salvo até serem editados. Gramas e horas do produto são **por impressão** (mesa), exatamente como o fatiador mostra; `piecesPerPrint` (peças por mesa, padrão 1) e `quantity` (total de peças, padrão 1) definem quantas impressões o lote exige, de forma **proporcional** (sem arredondar mesa parcial: 12 peças com 5 por mesa = 2,4 impressões). O fator fica em `Product.PrintRuns` (backend):

```
printRuns     = quantity / piecesPerPrint
material      = Σ (gramsUsed × printRuns / 1000) × filament.filamentPrice
energia       = (averagePowerWatts / 1000) × totalHours × printRuns × kwhPrice
depreciação   = depreciationEnabled ? printerValue / printerLifespanHours × totalHours × printRuns : 0
manutenção    = maintenanceEnabled (e depreciação ligada) ? depreciação × maintenancePercentage / 100 : 0
falha         = failureEnabled ? (material + energia + depreciação + manutenção) × failureRatePercentage / 100 : 0
costPrice     = material + energia + depreciação + manutenção + falha        (custo real do lote)
suggestedSalePrice = costPrice × (1 + defaultProfitMarginPercentage / 100)   (lote)
salePrice     = salePriceOverride × qtd (se enviado) senão suggestedSalePrice  (lote)
unitSalePrice = salePrice / qtd
```

Na fórmula acima, `averagePowerWatts`, `printerValue`, `printerLifespanHours`, `maintenancePercentage`, `failureRatePercentage`, `defaultProfitMarginPercentage` e os toggles são **da impressora do produto** (tela `/impressoras`); `kwhPrice` é de `UserSettings` (tela `/configuracoes`). Depreciação, manutenção e perda por falha são **opcionais, cada uma com liga/desliga por impressora** (`depreciationEnabled`, `maintenanceEnabled`, `failureEnabled`, desligados por padrão). Mão de obra ainda não existe. O front nunca reproduz essa conta — só manda `printerId`, `totalHours`, `piecesPerPrint`, `quantity`, os filamentos usados (`filamentId` + `gramsUsed`, por impressão) e, opcionalmente, `salePriceOverride` (**preço por unidade**; `0`/vazio vira `null` no submit pra usar o sugerido). `ProductDto`/`Product` (`src/types/product.ts`) trazem `costPrice`, `salePrice` (total do lote, usado no faturamento da home), `unitSalePrice`, `suggestedSalePrice` (sempre recalculado com a margem *atual* da impressora; sem impressora = `salePrice` salvo), `printerId`/`printerName` e os totais do lote já calculados — `batchHours` (`totalHours × printRuns`) e `batchFilament` (`totalFilament × printRuns`). Use esses dois pra exibir/somar horas e gramas do lote; nunca multiplique `totalHours`/`totalFilament` por `quantity` no front. O estoque de filamento é descontado em `gramsUsed × printRuns`, **só quando o produto é produzido** (`isProduced`, ver CLAUDE.md da raiz): produto novo nasce orçamento e o preço é calculado do mesmo jeito. Produtos criados antes desse campo têm `piecesPerPrint = 1` (default da coluna), então o custo deles não mudou.
