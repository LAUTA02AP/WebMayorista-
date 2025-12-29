// src/services/moks/productosDb.js
const PRODUCTOS_KEY = "mock_productos_v1";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr) {
  return arr[rand(0, arr.length - 1)];
}

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

function generarProductos(min = 120) {
  const rubros = ["FERRETERÍA", "AUTOPARTES", "HERRAMIENTAS", "LIMPIEZA", "ELECTRICIDAD"];
  const subRubros = {
    "FERRETERÍA": ["TORNILLERÍA", "FIJACIONES", "ADHESIVOS"],
    "AUTOPARTES": ["FRENOS", "FILTROS", "SUSPENSIÓN"],
    "HERRAMIENTAS": ["MANUALES", "ELÉCTRICAS", "ACCESORIOS"],
    "LIMPIEZA": ["HOGAR", "AUTOMOTOR", "INDUSTRIAL"],
    "ELECTRICIDAD": ["CABLES", "ILUMINACIÓN", "TÉRMICAS"],
  };

  const marcas = ["ACME", "BOSCH", "FIAT", "SKF", "PHILIPS", "3M", "STANLEY"];

  const productos = Array.from({ length: Math.max(min, 30) }, (_, i) => {
    const rubro = sample(rubros);
    const sub = sample(subRubros[rubro]);
    const marca = sample(marcas);

    const codigo = `P-${String(i + 1).padStart(5, "0")}`;
    const descripcion = `${marca} ${sub} ${rand(10, 999)}`;

    const disponible = Math.random() > 0.15; // 85% disponibles
    const oferta = Math.random() > 0.8;      // 20% en oferta

    const precioLista = Number((rand(500, 50000) + Math.random()).toFixed(2));
    const precioFinal = oferta ? Number((precioLista * 0.85).toFixed(2)) : precioLista;

    return {
      // Campos típicos para que tu UI "pick" encuentre algo sí o sí
      Codigo: codigo,
      Descripcion: descripcion,
      Rubro: rubro,
      SubRubro: sub,
      Marca: marca,

      Disponible: disponible,
      Oferta: oferta,

      PrecioLista: precioLista,
      PrecioFinal: precioFinal,

      // opcional
      Stock: disponible ? rand(1, 50) : 0,
      ImagenUrl: null,
    };
  });

  return productos;
}

function ensureProductos(min = 120) {
  const raw = localStorage.getItem(PRODUCTOS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= min) return parsed;
    } catch {
      // si está corrupto se regenera abajo
    }
  }

  const created = generarProductos(min);
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(created));
  return created;
}

function buildFiltrosAdic(productosFiltrados) {
  const uniq = (arr) => Array.from(new Set(arr)).sort();

  const rubros = uniq(productosFiltrados.map((p) => p.Rubro || "TODOS")).map((x) => ({ Descripcion: x }));
  const subRubros = uniq(productosFiltrados.map((p) => p.SubRubro || "TODOS")).map((x) => ({ Descripcion: x }));

  // tu API real arma CatUser1..6, acá lo dejamos vacío o “TODOS”
  const base = [{ Descripcion: "TODOS" }];

  return {
    Rubros: rubros.length ? rubros : base,
    SubRubros: subRubros.length ? subRubros : base,
    CatUser1: base,
    CatUser2: base,
    CatUser3: base,
    CatUser4: base,
    CatUser5: base,
    CatUser6: base,
  };
}

/**
 * Simula la respuesta del backend real:
 * { Paginacion, Productos, filtrosAdic }
 */
export function getProductosMock({
  texto = "",
  disponible = false,
  ofertas = false,
  pageNumber = 1,
  pageSize = 50, // 0 => todo
} = {}) {
  const all = ensureProductos(120);

  const q = normalize(texto);

  let filtered = all;

  if (q) {
    filtered = filtered.filter((p) => {
      const hay = normalize(p.Codigo) + " " + normalize(p.Descripcion) + " " + normalize(p.Marca);
      return hay.includes(q);
    });
  }

  if (disponible) filtered = filtered.filter((p) => p.Disponible === true);
  if (ofertas) filtered = filtered.filter((p) => p.Oferta === true);

  const totalRows = filtered.length;

  // pageSize = 0 => todo
  const size = pageSize === 0 ? totalRows || 1 : Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalRows / size));
  const page = Math.min(Math.max(1, pageNumber), totalPages);

  const start = (page - 1) * size;
  const end = start + size;
  const pageItems = pageSize === 0 ? filtered : filtered.slice(start, end);

  return {
    Paginacion: {
      TotalCount: totalRows,
      PageSize: pageSize === 0 ? totalRows : size,
      CurrentPage: page,
      TotalPages: totalPages,
    },
    Productos: pageItems,
    filtrosAdic: buildFiltrosAdic(filtered),
  };
}

// Si querés resetear rápido en dev
export function resetProductosMock() {
  localStorage.removeItem(PRODUCTOS_KEY);
}
