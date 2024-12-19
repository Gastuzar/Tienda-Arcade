const productos = [];
const imgProductos = [
  "./imagenes/img1.png",
  "./imagenes/img2.png",
  "./imagenes/img3.png",
  "./imagenes/img4.png",
  "./imagenes/img5.png",
  "./imagenes/img6.png",
  "./imagenes/img7.png",
  "./imagenes/img8.png",
  "./imagenes/img9.png",
];

function mostrarProductos() {
  const contenedorProductos = document.getElementById("productos-en-venta");

  const peticion = async () => {
    try {
      const response = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=Consola+Arcade`);
      const datos = await response.json();
      const data = datos.results;

      productos.length = 0; 
      contenedorProductos.innerHTML = ""; 
  
      data.slice(0, 9).forEach((item, index) => {
        productos.push({
          id: item.id,
          title: item.title,
          price: item.price,
          thumbnail: item.thumbnail,
        });

        const card = document.createElement("div");
        card.id = "cartaproducto";
        card.style.width = "18rem";
        card.style.height = "32rem";
        card.style.margin = "10px";
        
        const imagenAgregada = imgProductos[index];
        card.innerHTML = `
          <h3>${item.title}</h3>
          <img id = "imgagregada" src="${imagenAgregada}" alt="${item.title}">
          <div class="card-body">
            <h5>${item.title}</h5>
            <p>Precio: $${item.price.toLocaleString("es-ES")}</p>
            <button id="agregar-${item.id}" class="btn-agregar">Agregar al Carrito</button>
          </div>
        `;
    


        contenedorProductos.appendChild(card);
      });

      inicializarBotones();
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  peticion();
}

mostrarProductos();

function agregarAlCarrito(producto) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const existe = carrito.find((item) => item.id === producto.id)

  if (existe) {
    existe.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
}

console.log(carrito);

function inicializarBotones() {
  productos.forEach((producto) => {
    const boton = document.getElementById(`agregar-${producto.id}`);
    if (boton) {
      boton.addEventListener("click", () => {
        agregarAlCarrito(producto);
        mostrarCarrito();
        Toastify({
          text: `${producto.title} se ha agregado al carrito ⬇⬇⬇.`,
          gravity: "top", 
          position: "right", 
          onClick: () => document.getElementById("tabla-carrito").scrollIntoView({ behavior: "smooth" }),
          style: {
                background: "#ff33cc",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "background-color 0.3s, box-shadow 0.3s",
                boxShadow: "0 0 5px #ff1177",
                fontWeight: "bold",
                padding: "10px 20px",
                position: "fixed"
          }
        }).showToast();
      });
    } 
  });
}
function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const tablaCarrito = document.getElementById("tabla-carrito");
  const totalCarrito = document.getElementById("total-carrito");

  tablaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    const filaVacia = document.createElement("tr");
    filaVacia.innerHTML = `
      <td colspan="5">El carrito está vacío</td>
    `;
    tablaCarrito.appendChild(filaVacia);

    totalCarrito.textContent = "$0";
  } else {
    carrito.forEach((producto) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${producto.title}</td>
        <td>$${producto.price.toLocaleString("es-ES")}</td>
        <td>${producto.cantidad}</td>
        <td>$${(producto.price * producto.cantidad).toLocaleString("es-ES")}</td>
        <td>
          <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
        </td>
      `;
      tablaCarrito.appendChild(fila);

      const btnEliminar = fila.querySelector(".btn-eliminar");
      btnEliminar.addEventListener("click", () => {
        eliminarProducto(producto.id);
      });
    });

    const total = carrito.reduce(
      (acum, item) => acum + item.price * item.cantidad,
      0
    );

    totalCarrito.textContent = `$${total.toLocaleString("es-ES")}`;
  }
}

mostrarCarrito();

if (carrito.length !== 0) {
  mostrarCarrito();
}

function eliminarProducto(id) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const index = carrito.findIndex((item) => item.id === id);

  if (index !== -1) {
    const productoEliminado = carrito[index];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    Swal.fire({
      title: `Producto "${productoEliminado.title}" eliminado del carrito.`,
      icon: "warning",
      draggable: true
    });
    mostrarCarrito();
    const totalCarrito = carrito.reduce(
      (acumulador, item) => acumulador + item.price * item.cantidad,
      0
    );
    
    const eliminarDelTotal = document.getElementById("total-carrito");
    eliminarDelTotal.textContent = `$${totalCarrito.toLocaleString("es-ES", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}

function finalizarCompra() {
  const btnFinalizarCompra = document.getElementById("finalizar-compra");

  btnFinalizarCompra.addEventListener("click", () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalPrecio = document.getElementById("total-carrito")

    if (totalPrecio === 0 ||carrito.length === 0) {
      Swal.fire({
        title: "El carrito está vacío!",
        icon: "warning",
        draggable: true
      });
      return;
    }
    if (carrito.length !== 0 || carrito.length >= 1) {
      const total = carrito.reduce(
        (acumulador, item) => acumulador + item.price * item.cantidad,
        0
      );
        Swal.fire({
          title: `Total a pagar: $${total.toLocaleString("es-ES")}`,
          text: "Desea finalizar la compra?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí!",
          cancelButtonText: "Cancelar"
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Compra realizada!",
              text: "Gracias por su compra",
              icon: "success"
            });
          }
        });
      
      localStorage.removeItem("carrito");
      document.getElementById("tabla-carrito").innerHTML = "";
      document.getElementById("total-carrito").textContent = "0";
      }
    });
}

finalizarCompra();



function agregarLogo(ruta, altTexto) {
  const origen = document.getElementById("encabezado");
  const logo = document.createElement("img");
  
  logo.src = ruta;
  logo.alt = altTexto;

  logo.style.width = "50%";
  logo.style.margin = "-12px";
  logo.style.padding = "10";
  
  origen.appendChild(logo);
}

agregarLogo("./imagenes/logo4.png", "Logo2");
agregarLogo("./imagenes/logo2.png", "Logo3");
agregarLogo("./imagenes/logo3.png", "Logo4");

const linkTitulo = document.getElementById("productos-titulo");
const listadoProductos = document.getElementById("productos-en-venta");

linkTitulo.addEventListener("click", () => {
    listadoProductos.scrollIntoView({ behavior: "smooth" });
});

function agregarFooter() {
  const footer = document.getElementById("footer");
  
  const parrafoFooter = document.createElement("p");
  parrafoFooter.textContent =
    "© Copyright 2024 - Tienda Arcade By Gaston Zarate | Todos los derechos reservados | Córdoba - Córdoba, Argentina.";
  
  footer.appendChild(parrafoFooter);
}

agregarFooter();



