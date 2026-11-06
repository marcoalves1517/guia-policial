# Guia de Expediente Policial (OPC) — Android PWA

Aplicação móvel tática e offline desenvolvida para consulta rápida de procedimentos e expediente policial (GNR / PSP).

---

## 🚀 Como Funciona

1. **Acesso Reservado e Privado:**
   - Ao abrir a app pela primeira vez, é solicitado um **Código de Acesso (PIN)**.
   - Código padrão inicial: `GNR2025`
   - O código pode ser alterado a qualquer momento nas definições da aplicação (ícone da engrenagem).

2. **Categorias Operacionais Disponíveis (60 Procedimentos):**
   - 🛡️ **Património:** Furto simples/qualificado, Roubo, Dano, Burla, Receptação, Abuso de Confiança...
   - 👤 **Pessoas:** Homicídio, Ofensas corporais, Violência Doméstica, Ameaça, Perseguição (Stalking), Sequestro...
   - ⚠️ **Crimes Sexuais:** Violação, Coação sexual, Abuso sexual de crianças, Aliciamento, Pornografia de menores...
   - ⚖️ **Autoridade Pública:** Resistência e coação sobre funcionário, Desobediência, Falsificação de documentos...
   - 🚗 **Rodoviários:** Álcool (TAS >= 1,20 g/l), Estupefacientes, Sem habilitação legal, Condução perigosa, Fuga...
   - 💊 **Drogas:** Tráfico simples/agravado/menor gravidade, Consumo pessoal (Lei 30/2000 vs. art. 40.º), Cultivo...
   - 🔫 **Armas:** Detenção de arma proibida (Classe A), Porte ilegal, Tráfico, Munições, Porte sob efeito de álcool...
   - 💻 **Informáticos:** Burla informática, Hacking, Phishing, Dano informático, Sextortion...

3. **Ficha Completa de Cada Expediente:**
   - **Enquadramento Legal & Artigo** (sem molduras penais desnecessárias).
   - **Natureza Jurídica:** Crime Público, Semipúblico ou Particular (aviso claro sobre necessidade ou dispensa de queixa).
   - **Regime de Flagrante Delito:** Quando deter obrigatoriamente e prazos legais de apresentação ao MP.
   - **Passo a Passo no Terreno:** Procedimento cronológico de segurança, identificação e preservação de vestígios.
   - **Checklist Interativa de Formulários:** Assinale com um toque os documentos feitos (Auto de Notícia, TIR, Apreensão, Direitos de Arguido/Vítima, etc.).
   - **Atenção OPC:** Alertas críticos para não cometer nulidades processuais.
   - **Botão Copiar Resumo:** Copia toda a ficha para a área de transferência para colar em mensagens ou rascunhos.

---

## 📲 Como Instalar nos Telemóveis Android dos Amigos

A app é uma **PWA (Progressive Web App)** nativa para Android. **Não precisa de Google Play nem de instalar ficheiros APK complicados:**

1. Envia aos seus colegas o link da aplicação (por exemplo, alojada no GitHub Pages ou Vercel).
2. O colega abre o link no **Google Chrome** no telemóvel Android.
3. Toca nos 3 pontinhos do Chrome (ou no aviso inferior) e escolhe:
   👉 **"Instalar aplicação"** ou **"Adicionar ao ecrã principal"**.
4. A app fica instalada no telemóvel com o seu próprio ícone azul tático, abre em ecrã inteiro (sem barra de navegador) e **funciona 100% offline**, mesmo sem rede no meio do mato ou em estradas isoladas!

---

## 🔄 Como Atualizar Procedimentos nos Telemóveis de Todos

Esta é a grande vantagem deste sistema: **os seus colegas nunca precisam de reinstalar nada.**

1. Abra o ficheiro `expedientes.json`.
2. Adicione um novo crime ou altere o passo a passo de um procedimento existente.
3. Envie a alteração para o GitHub (ou substitua o ficheiro no alojamento).
4. **Automaticamente:** Na próxima vez que os seus colegas abrirem a app com ligação à internet (Wi-Fi ou 4G), a app descarrega a versão nova em silêncio e atualiza a base de dados local deles.

---

## 💻 Como Testar Agora no seu Computador

Na pasta do projeto, execute no terminal:

```bash
cd /home/marco/Transferências/Antigravity/guia-policial-app
python3 -m http.server 8080
```

Abra o navegador em: [http://localhost:8080](http://localhost:8080)
Insira o PIN: `GNR2025`
