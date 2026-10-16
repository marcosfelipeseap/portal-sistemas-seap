require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  db: { schema: 'paineis' }
});

const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_scp_ugtr_seap_2026_sso';

// Catálogo dos sistemas
const SISTEMAS = {
  // Painéis de Gestão
  artesanato_painel: {
    categoria: 'gestao',
    titulo: 'PAINEL DE ARTESANATO',
    url: 'https://script.google.com/macros/s/AKfycbyJpuu4IyoKWTQtdsewMx55uUt4wsUM3OmwASEaECVyix5-gl0NNGFFfZiEXIvsyvgi6Q/exec',
    svgPath: 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4 11 4.67 11 5.5 10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4 16 4.67 16 5.5 15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S18.67 8 19.5 8 21 8.67 21 9.5 20.33 11 19.5 11z'
  },
  logistico_demandas: {
    categoria: 'gestao',
    titulo: 'PAINEL LOGÍSTICO DE DEMANDAS',
    url: 'https://script.google.com/macros/s/AKfycbxWnUYIAWJuc8lvniHKgzHWUmYnh6IeeIK_u5EWs3lo9Anez81iPYaijAKi33uwPZbs/exec',
    svgPath: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-8.5l1.96 2.5H17V9.5h2.5zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z'
  },
  malharia_painel: {
    categoria: 'gestao',
    titulo: 'PAINEL DA MALHARIA',
    url: 'https://painelmalhariaseap.vercel.app/',
    svgPath: 'M12 3c-1.1 0-2 .9-2 2H6L2 7v4h3v10h14V11h3V7l-4-2h-4c0-1.1-.9-2-2-2zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z'
  },
  marcenaria_painel: {
    categoria: 'gestao',
    titulo: 'PAINEL DA MARCENARIA',
    url: 'https://painelmarcenariaseap.vercel.app/',
    svgPath: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM11 20H6V4h5v16zm8 0h-5V4h5v16zm-5-9h-2V9h2v2zm-6 0H6V9h2v2z'
  },
  seduc_fundef: {
    categoria: 'gestao',
    titulo: 'PAINEL SEDUC / FUNDEF',
    url: 'https://script.google.com/macros/s/AKfycbx_B3an9u54T4ZJLAWiSrR3-I0DvQXm5buqq3kDKxqoiRBtY_mT220hPYuVUH5coHDaSg/exec',
    svgPath: 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z'
  },
  serralheria_painel: {
    categoria: 'gestao',
    titulo: 'PAINEL DA SERRALHERIA',
    url: 'https://painelserralheriaseap.vercel.app/',
    svgPath: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L7.6 4.8 5.4 7 2.2 4.2C1 6.6 1.4 9.6 3.4 11.6c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l1.9-1.9c.4-.4.4-1.1 0-1.5z'
  },
  upfem_painel: {
    categoria: 'gestao',
    titulo: 'PAINEL UPFEM (MALHARIA)',
    url: 'https://script.google.com/macros/s/AKfycbyrsS1M7p1mh0Zi-qYjFcgAuJ6s-VYIRMXTuL80EjhXL-_PmtUgqrQWiVw8Jsem3sab/exec',
    svgPath: 'M12 2c-1.66 0-3 1.34-3 3 0 1.05.54 1.95 1.35 2.47L3 14v2h18v-2l-7.35-6.53C14.46 6.95 15 6.05 15 5c0-1.66-1.34-3-3-3zm0 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM5.5 14L12 8.22 18.5 14H5.5z'
  },

  // Sistemas e Registros
  artesanato_sistema: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DO ARTESANATO',
    url: 'https://scpartesanato.vercel.app',
    shareUrl: 'https://scpartesanato.onrender.com',
    svgPath: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z'
  },
  frota_ugtr: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DA FROTA UGTR',
    url: 'https://frotaugtr.vercel.app/',
    svgPath: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5zM7.5 16c.83 0 1.5-.67 1.5-1.5S8.33 13 7.5 13 6 13.67 6 14.5 6.67 16 7.5 16zm9 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z'
  },
  fundef_registros: {
    categoria: 'sistemas',
    titulo: 'FUNDEF REGISTROS',
    url: 'https://script.google.com/macros/s/AKfycbzatY5frzVXL_SoBAEd9qbrFMZ2Nf9pyw25GYFtTKyBMBwSCHxzX_wm1TtHwW5jXTJk/exec',
    svgPath: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z'
  },
  gerador_termos: {
    categoria: 'sistemas',
    titulo: 'GERADOR DE TERMOS DE ENTREGA',
    url: 'https://script.google.com/macros/s/AKfycbytReYhVjigwL5oNt9DQ1npweOVF8BN1KmnMEJASEXRNmq8PdzqJth0q6P3aUNTxN_f/exec',
    svgPath: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
  },
  plantoes_sabados: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DE PLANTÕES DE SÁBADOS - SCP',
    url: 'https://script.google.com/macros/s/AKfycbwr5K73_5fLTj0ej9c4z9eZcW-6kBl_ia_S_r9LdeZ3ovB6LcHm6vPxltnOwmAyO1MQjg/exec',
    svgPath: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'
  },
  malharias_sistema: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DE MALHARIAS',
    url: 'https://malhariaseap.com',
    svgPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'
  },
  orcamento_ugtr: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DE ORÇAMENTO',
    url: 'https://orcamentougtr.vercel.app/',
    svgPath: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
  },
  insumos_ugtr: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DE INSUMOS',
    url: 'https://insumougtr.vercel.app/',
    svgPath: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z'
  },
  serralheria_sistema: {
    categoria: 'sistemas',
    titulo: 'SISTEMA DA SERRALHERIA',
    url: 'https://maroon-kingfisher-471984.hostingersite.com/',
    svgPath: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.1L7.6 4.8 5.4 7 2.2 4.2C1 6.6 1.4 9.6 3.4 11.6c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l1.9-1.9c.4-.4.4-1.1 0-1.5z'
  }
};

// Middleware de autenticação (checa o token e confirma no banco se continua ativo)
async function autenticar(req, res, next) {
  const token = req.cookies.portal_token;
  if (!token) {
    const redirectUrl = req.query.redirect ? `?redirect=${encodeURIComponent(req.query.redirect)}` : '';
    return res.redirect(`/login${redirectUrl}`);
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { data: userDb } = await supabase
      .from('usuarios')
      .select('id, nome, username, cargo, ativo')
      .eq('id', decoded.id)
      .single();

    if (!userDb || !userDb.ativo) {
      res.clearCookie('portal_token');
      return res.redirect('/login');
    }

    req.user = userDb;
    next();
  } catch (err) {
    res.clearCookie('portal_token');
    return res.redirect('/login');
  }
}

// Middleware exclusivo para Administradores
function apenasAdmin(req, res, next) {
  if (req.user && req.user.cargo === 'admin') {
    return next();
  }
  return res.status(403).send('Acesso restrito a administradores.');
}

// TELA DE LOGIN
app.get('/login', (req, res) => {
  const redirect = req.query.redirect || '';
  const token = req.cookies.portal_token;

  if (token) {
    try {
      const user = jwt.verify(token, JWT_SECRET);
      if (redirect) {
        const ssoToken = jwt.sign(
          { id: user.id, nome: user.nome, username: user.username, cargo: user.cargo },
          JWT_SECRET,
          { expiresIn: '8h' }
        );
        const separador = redirect.includes('?') ? '&' : '?';
        return res.redirect(`${redirect}${separador}sso_token=${ssoToken}`);
      }
      return res.redirect('/');
    } catch (e) {
      res.clearCookie('portal_token');
    }
  }

  res.render('login', { erro: null, sucesso: null, redirect });
});

// PROCESSAR LOGIN POR USERNAME
app.post('/login', async (req, res) => {
  const { username, senha, redirect } = req.body;
  const loginFormatado = (username || '').toLowerCase().trim();

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', loginFormatado)
      .single();

    if (error || !usuario) {
      return res.render('login', { erro: 'Usuário de login não encontrado.', sucesso: null, redirect });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.render('login', { erro: 'Senha incorreta.', sucesso: null, redirect });
    }

    if (!usuario.ativo) {
      return res.render('login', {
        erro: 'Seu cadastro ainda está pendente. Aguarde a liberação de um Administrador.',
        sucesso: null,
        redirect
      });
    }

    const tokenSessao = jwt.sign(
      { id: usuario.id, nome: usuario.nome, username: usuario.username, cargo: usuario.cargo },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('portal_token', tokenSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    if (redirect) {
      const ssoToken = jwt.sign(
        { id: usuario.id, nome: usuario.nome, username: usuario.username, cargo: usuario.cargo },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      const separador = redirect.includes('?') ? '&' : '?';
      return res.redirect(`${redirect}${separador}sso_token=${ssoToken}`);
    }

    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return res.render('login', { erro: 'Erro interno ao fazer login.', sucesso: null, redirect });
  }
});

// PROCESSAR CADASTRO POR USERNAME
app.post('/cadastro', async (req, res) => {
  const { nome, username, senha, confirmar_senha, redirect } = req.body;
  const loginFormatado = (username || '').toLowerCase().trim().replace(/\s+/g, '');

  if (senha !== confirmar_senha) {
    return res.render('login', { erro: 'As senhas não coincidem.', sucesso: null, redirect });
  }

  try {
    const { count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true });

    const primeiroUsuario = (count === 0);
    const senhaHash = await bcrypt.hash(senha, 10);

    const { error } = await supabase
      .from('usuarios')
      .insert([{
        nome: nome.trim(),
        username: loginFormatado,
        senha_hash: senhaHash,
        cargo: primeiroUsuario ? 'admin' : 'servidor',
        ativo: primeiroUsuario ? true : false
      }]);

    if (error) {
      if (error.code === '23505') {
        return res.render('login', { erro: 'Este nome de usuário já está em uso.', sucesso: null, redirect });
      }
      throw error;
    }

    const msgSucesso = primeiroUsuario
      ? 'Primeiro usuário cadastrado como Administrador! Você já pode fazer login.'
      : 'Cadastro enviado com sucesso! Aguarde um administrador aprovar seu acesso.';

    return res.render('login', { erro: null, sucesso: msgSucesso, redirect });
  } catch (err) {
    console.error(err);
    return res.render('login', { erro: 'Erro ao realizar cadastro.', sucesso: null, redirect });
  }
});

// LOGOUT
app.get('/logout', (req, res) => {
  res.clearCookie('portal_token');
  res.redirect('/login');
});

// PÁGINA PRINCIPAL (MENU DE SISTEMAS)
app.get('/', autenticar, async (req, res) => {
  const gestao = Object.entries(SISTEMAS)
    .filter(([_, s]) => s.categoria === 'gestao')
    .map(([key, s]) => ({ key, ...s }));

  const sistemas = Object.entries(SISTEMAS)
    .filter(([_, s]) => s.categoria === 'sistemas')
    .map(([key, s]) => ({ key, ...s }));

  let pendentesCount = 0;
  if (req.user.cargo === 'admin') {
    const { count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', false);
    pendentesCount = count || 0;
  }

  res.render('index', {
    usuario: req.user,
    gestao,
    sistemas,
    pendentesCount
  });
});

// ==================== ROTAS DE ADMINISTRAÇÃO ====================

app.get('/admin/usuarios', autenticar, apenasAdmin, async (req, res) => {
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('id, nome, username, cargo, ativo, criado_em')
    .order('ativo', { ascending: true })
    .order('criado_em', { ascending: false });

  res.render('admin', {
    usuarioLogado: req.user,
    usuarios: usuarios || [],
    erro: error ? 'Erro ao carregar lista de usuários.' : null
  });
});

app.post('/admin/usuarios/:id/status', autenticar, apenasAdmin, async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;

  if (id === req.user.id) return res.redirect('/admin/usuarios');

  await supabase
    .from('usuarios')
    .update({ ativo: ativo === 'true' })
    .eq('id', id);

  res.redirect('/admin/usuarios');
});

app.post('/admin/usuarios/:id/cargo', autenticar, apenasAdmin, async (req, res) => {
  const { id } = req.params;
  const { cargo } = req.body;

  if (id === req.user.id) return res.redirect('/admin/usuarios');

  await supabase
    .from('usuarios')
    .update({ cargo: cargo === 'admin' ? 'admin' : 'servidor' })
    .eq('id', id);

  res.redirect('/admin/usuarios');
});

app.post('/admin/usuarios/:id/excluir', autenticar, apenasAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) return res.redirect('/admin/usuarios');

  await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  res.redirect('/admin/usuarios');
});

// ==================== ROTAS SSO ====================

app.get('/ir/:chave', autenticar, (req, res) => {
  let chave = req.params.chave;

  // Atalhos / Apelidos úteis para evitar erros de digitação nas chamadas
  if (chave === 'serralheria') chave = 'serralheria_painel';
  if (chave === 'malharia' || chave === 'upfem') chave = 'upfem_painel';
  if (chave === 'seduc') chave = 'seduc_fundef';
  if (chave === 'logistico' || chave === 'logistica') chave = 'logistico_demandas';
  if (chave === 'artesanato') chave = 'artesanato_painel';

  const sistema = SISTEMAS[chave];
  if (!sistema) return res.status(404).send('Sistema não encontrado');

  const ssoToken = jwt.sign(
    { id: req.user.id, nome: req.user.nome, username: req.user.username, cargo: req.user.cargo },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const separador = sistema.url.includes('?') ? '&' : '?';
  res.redirect(`${sistema.url}${separador}sso_token=${ssoToken}`);
});

app.get('/api/sso/verificar', (req, res) => {
  const token = req.query.token || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ valido: false, mensagem: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valido: true, usuario: decoded });
  } catch (err) {
    return res.status(401).json({ valido: false, mensagem: 'Token expirado ou inválido' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Portal de Sistemas rodando na porta ${PORT}`);
});