# Auto Car Serviços Viseu

Landing page institucional da **Auto Car Serviços Viseu**, oficina automóvel em Viseu, Portugal.

O site apresenta a oficina e os seus serviços, facilita o contacto e permite que o visitante envie um pedido de marcação diretamente para o WhatsApp.

## Estado do projeto

- Site estático desenvolvido com HTML, CSS e JavaScript.
- Idioma: português de Portugal (pt-PT).
- Identidade visual: preto, vermelho, branco e cinzento.
- Layout responsivo para computador e telemóvel.
- Pedido de marcação encaminhado para o WhatsApp.
- Atalho flutuante do WhatsApp.
- Morada e mapa de localização.
- A branch `redesign/galeria-fotos-reais` destina-se ao desenvolvimento e testes. Não publicar em produção antes da validação.

## Estrutura do projeto

A estrutura pode variar consoante a versão do site. Consulte o separador **Code** para confirmar os nomes reais dos ficheiros. Uma organização recomendada para as fotografias é:

```
Site-Autocar/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    └── images/
        ├── oficina-exterior.jpg
        ├── oficina-interior.jpg
        ├── reparacao-automovel.jpg
        ├── equilibragem-pneus.jpg
        └── revisao-oleo.jpg
```

## Pré-visualizar no computador com VS Code

1. Abra a pasta do repositório no Visual Studio Code.
2. No terminal, execute:

   ```bash
   git fetch origin
   git switch redesign/galeria-fotos-reais
   git pull origin redesign/galeria-fotos-reais
   ```

3. Instale a extensão **Live Server**.
4. Clique com o botão direito em `index.html` e selecione **Open with Live Server**.

O navegador abrirá o site localmente. Ao guardar alterações, o Live Server atualiza a página.

## Adicionar as fotografias reais

### 1. Criar a pasta

No VS Code, clique com o botão direito na pasta principal do projeto, escolha **New Folder** e crie `assets/images`.

Coloque as fotografias nessa pasta. Use nomes simples, sem espaços nem acentos, por exemplo:

- `oficina-exterior.jpg` — fachada e entrada.
- `oficina-interior.jpg` — espaço de trabalho.
- `reparacao-automovel.jpg` — viatura em reparação.
- `equilibragem-pneus.jpg` — máquina de equilibragem.
- `revisao-oleo.jpg` — revisão, óleo e filtros.

### 2. Alterar uma imagem no HTML

Abra `index.html` e procure o elemento `<img>` que pretende substituir. Altere o atributo `src` para o caminho da nova imagem:

```html
<img
  src="assets/images/reparacao-automovel.jpg"
  alt="Automóvel em reparação na oficina Auto Car"
  loading="lazy"
  decoding="async"
>
```

O caminho é relativo ao ficheiro `index.html`. Não utilize caminhos locais do Windows, como `C:\\Users\\...`, pois não funcionarão quando o site for publicado.

### 3. Alterar uma imagem de fundo no CSS

Se a imagem estiver definida no CSS, abra o ficheiro de estilos e procure por `background` ou pela classe da secção (por exemplo, `.hero`). Se o CSS estiver em `assets/css/styles.css`, o caminho para as imagens será relativo a essa pasta:

```css
.hero {
  background:
    linear-gradient(90deg, rgba(8, 9, 11, .88), rgba(8, 9, 11, .35)),
    url("../images/reparacao-automovel.jpg") center / cover;
}
```

Mantenha as restantes propriedades da regra existente. O exemplo ilustra o caminho e não deve ser colado por cima de toda a regra sem verificar o CSS atual.

## Fotografias recomendadas por secção

| Fotografia | Onde utilizar |
|---|---|
| Carro branco em reparação | Destaque principal ou galeria de trabalhos |
| Fachada da oficina | Secção “A oficina” e localização |
| Carrinha Auto Car | Apresentação da estrutura e serviços |
| Máquina de equilibragem | Serviço de pneus / equilibragem |
| Logo Auto Car junto ao motor e produtos | Revisão e manutenção |

Dê prioridade às fotografias reais da oficina. Prefira imagens nítidas, bem iluminadas e comprimidas para carregarem rapidamente. Não altere nem redesenhe a logo original; confirme apenas se o caminho e o nome do ficheiro correspondem ao utilizado no HTML. Utilize fotografias de pessoas, matrículas ou clientes apenas com autorização.

## O que modificar

| Objetivo | Onde procurar |
|---|---|
| Títulos, textos, serviços e secções | `index.html` |
| Fotografias inseridas na página | Atributos `src` dos elementos `<img>` |
| Imagens de fundo | Regras `background` no CSS |
| Cores, tamanhos e espaçamentos | Ficheiro CSS |
| Número e link do WhatsApp | `index.html`, procurar `wa.me` |
| Morada e mapa | `index.html`, procurar o endereço ou `maps` |
| Instagram | `index.html`, procurar `auto_car_viseu` |
| Logo e favicon | `index.html`, procurar `logo` |

## Como funciona o pedido de marcação

O formulário prepara uma mensagem com os dados preenchidos e abre o WhatsApp através de um link. O pedido só chega à oficina quando o visitante envia a mensagem no WhatsApp. A marcação fica sujeita à confirmação da disponibilidade pelo responsável.

Antes de publicar, confirme o número de WhatsApp, o endereço, o Instagram e os horários de funcionamento.

## Enviar as alterações para o GitHub

Depois de editar e testar localmente:

```bash
git add .
git commit -m "Atualiza landing page e adiciona fotografias"
git push origin redesign/galeria-fotos-reais
```

Estes comandos enviam as alterações para a branch de desenvolvimento. Não fazem merge na `main` nem publicam automaticamente na produção.

## Checklist antes de publicar

- [ ] Confirmar que a logo original aparece corretamente no cabeçalho e no rodapé.
- [ ] Adicionar as fotografias reais e testar todos os caminhos.
- [ ] Confirmar telefone, WhatsApp, Instagram e morada.
- [ ] Testar o formulário e todos os links.
- [ ] Confirmar o mapa e a localização.
- [ ] Testar em computador e telemóvel.
- [ ] Rever os textos em português de Portugal.
- [ ] Confirmar autorização para publicar as imagens.
- [ ] Aprovar a versão de desenvolvimento antes de integrar na branch principal.

---

README de apoio ao desenvolvimento da landing page Auto Car Serviços Viseu.
