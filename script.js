let productos = {};
let bitacora = [];
const usuarios = {
    maestro: 'maestro123',
    vendedor: 'vendedor123'
};

function login() {
    const usuario = document.getElementById("username").value;
    const contrasena = document.getElementById("password").value;

    if (usuarios[usuario] && usuarios[usuario] === contrasena) {
        document.getElementById("login").style.display = "none";
        document.getElementById("menu").style.display = "block";
        setupMenu(usuario);
    } else {
        alert("Usuario o contraseña no válidos");
    }
}

function setupMenu(usuario) {
    const menuButtons = document.getElementById("menuButtons");
    menuButtons.innerHTML = ""; 

    if (usuario === 'maestro') {
        menuButtons.innerHTML += `
            <button onclick="showSection('addProduct')">AGREGAR PRODUCTO</button>
            <button onclick="showSection('saleProduct')">VENTA DE PRODUCTO</button>
            <button onclick="showSection('showStock')">MOSTRAR EXISTENCIAS</button>
            <button onclick="showSection('showKardex')">KARDEX DE PRODUCTO</button>
            <button onclick="showSection('addInventory')">INGRESO DE INVENTARIO</button>
        `;
    }

    if (usuario === 'vendedor') {
        menuButtons.innerHTML += `
            <button onclick="showSection('saleProduct')">VENTA DE PRODUCTO</button>
            <button onclick="showSection('showStock')">MOSTRAR EXISTENCIAS</button>
        `;
    }

    menuButtons.innerHTML += `
        <button onclick="logout()">CERRAR SESIÓN</button>
    `;
}

function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).style.display = "block";

    if (sectionId === 'saleProduct') {
        populateSaleDropdown();
    } else if (sectionId === 'showStock') {
        displayStock();
    } else if (sectionId === 'addInventory') {
        populateInventoryDropdown();
    }
}

function hideAllSections() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("addProduct").style.display = "none";
    document.getElementById("saleProduct").style.display = "none";
    document.getElementById("showStock").style.display = "none";
    document.getElementById("showKardex").style.display = "none";
    document.getElementById("addInventory").style.display = "none";
    document.getElementById("login").style.display = "none";
}

function clearAddProduct() {
    document.getElementById("productCode").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productQuantity").value = "";
    document.getElementById("productCost").value = "";
    document.getElementById("productPriceCash").value = "";
    document.getElementById("productPriceCredit").value = "";
    hidePreview();
}

function previewProduct() {
    const codigo = document.getElementById("productCode").value;
    const nombre = document.getElementById("productName").value;
    const costo = parseFloat(document.getElementById("productCost").value);
    const precioContado = parseFloat(document.getElementById("productPriceCash").value);
    const precioCredito = parseFloat(document.getElementById("productPriceCredit").value);
    const cantidad = parseInt(document.getElementById("productQuantity").value);

    if (productos[codigo]) {
        alert("El código de producto ya existe.");
        return;
    }

    const total = cantidad * costo;
    const previewDetails = `
        <strong>CÓDIGO:</strong> ${codigo}<br>
        <strong>NOMBRE:</strong> ${nombre}<br>
        <strong>CANTIDAD:</strong> ${cantidad}<br>
        <strong>COSTO:</strong> Q${costo.toFixed(2)}<br>
        <strong>PRECIO CONTADO:</strong> Q${precioContado.toFixed(2)}<br>
        <strong>PRECIO CRÉDITO:</strong> Q${precioCredito.toFixed(2)}<br>
        <strong>TOTAL:</strong> Q${total.toFixed(2)}
    `;
    document.getElementById("previewDetails").innerHTML = previewDetails;
    document.getElementById("previewSection").style.display = "block"; 
}

function confirmAddProduct() {
    const codigo = document.getElementById("productCode").value;
    const nombre = document.getElementById("productName").value;
    const costo = parseFloat(document.getElementById("productCost").value);
    const precioContado = parseFloat(document.getElementById("productPriceCash").value);
    const precioCredito = parseFloat(document.getElementById("productPriceCredit").value);
    const cantidad = parseInt(document.getElementById("productQuantity").value);

    productos[codigo] = {
        nombre: nombre,
        costo: costo,
        precioContado: precioContado,
        precioCredito: precioCredito,
        existencia: cantidad
    };

    bitacora.push({
        tipo: "Ingreso",
        codigo: codigo,
        nombre: nombre,
        cantidad: cantidad,
        fecha: new Date().toLocaleString()
    });

    alert("Producto agregado con éxito");
    clearAddProduct();
}

function populateSaleDropdown() {
    const saleCodeDropdown = document.getElementById("saleCode");
    saleCodeDropdown.innerHTML = ""; 

    for (const codigo in productos) {
        const option = document.createElement("option");
        option.value = codigo;
        option.textContent = `${productos[codigo].nombre} (${productos[codigo].existencia} en stock)`;
        saleCodeDropdown.appendChild(option);
    }
}

function updateProductName() {
    const codigo = document.getElementById("saleCode").value;
    const product = productos[codigo];
    if (product) {
        document.getElementById("productDetails").innerHTML = `NOMBRE: ${product.nombre}, EXISTENCIA: ${product.existencia}`;
    }
}

function sellProduct() {
    const codigo = document.getElementById("saleCode").value;
    const cantidad = parseInt(document.getElementById("saleQuantity").value);
    const tipo = document.getElementById("saleType").value;

    if (!productos[codigo]) {
        alert("Producto no encontrado.");
        return;
    }

    if (cantidad <= 0) {
        alert("No se puede vender una cantidad de 0 o menor.");
        return;
    }

    if (cantidad > productos[codigo].existencia) {
        alert("No hay suficiente existencia para realizar la venta.");
        return;
    }

    productos[codigo].existencia -= cantidad;

    bitacora.push({
        tipo: "Salida",
        codigo: codigo,
        nombre: productos[codigo].nombre,
        cantidad: cantidad,
        fecha: new Date().toLocaleString(),
        modo: tipo
    });

    alert("Venta realizada con éxito");
    document.getElementById("saleQuantity").value = ""; 
    populateSaleDropdown(); 
}

function displayStock() {
    const stockList = document.getElementById("stockList");
    stockList.innerHTML = ""; 

    for (const codigo in productos) {
        const product = productos[codigo];
        const row = `
            <tr>
                <td>${codigo}</td>
                <td>${product.nombre}</td>
                <td>${product.existencia}</td>
                <td>Q${product.precioContado.toFixed(2)}</td>
                <td>Q${product.precioCredito.toFixed(2)}</td>
            </tr>
        `;
        stockList.innerHTML += row;
    }
}

function showKardex() {
    const codigo = document.getElementById("kardexCode").value;
    const kardexList = document.getElementById("kardexList");
    kardexList.innerHTML = ""; 

    bitacora.forEach(movimiento => {
        if (movimiento.codigo === codigo) {
            const row = `
                <tr>
                    <td>${movimiento.fecha}</td>
                    <td>${movimiento.tipo}</td>
                    <td>${movimiento.nombre}</td>
                    <td>${movimiento.cantidad}</td>
                </tr>
            `;
            kardexList.innerHTML += row;
        }
    });

    if (kardexList.innerHTML === "") {
        kardexList.innerHTML = "<tr><td colspan='4'>No hay movimientos para este producto.</td></tr>";
    }
}

function populateInventoryDropdown() {
    const inventoryCodeDropdown = document.getElementById("inventoryCode");
    inventoryCodeDropdown.innerHTML = ""; 

    for (const codigo in productos) {
        const option = document.createElement("option");
        option.value = codigo;
        option.textContent = `${codigo} - ${productos[codigo].nombre}`;
        inventoryCodeDropdown.appendChild(option);
    }
}

function updateInventoryProductName() {
    const codigo = document.getElementById("inventoryCode").value;
    const product = productos[codigo];
    if (product) {
        document.getElementById("inventoryProductDetails").innerHTML = `NOMBRE: ${product.nombre}, EXISTENCIA: ${product.existencia}`;
    }
}

function confirmInventory() {
    const codigo = document.getElementById("inventoryCode").value;
    const cantidad = parseInt(document.getElementById("inventoryQuantity").value);

    if (!productos[codigo]) {
        alert("Producto no encontrado.");
        return;
    }

    if (cantidad <= 0) {
        alert("La cantidad a ingresar debe ser mayor a 0.");
        return;
    }

    const confirmation = confirm(`¿Está seguro que desea agregar ${cantidad} unidades al producto ${productos[codigo].nombre}?`);
    if (!confirmation) {
        return;
    }

    productos[codigo].existencia += cantidad;

    bitacora.push({
        tipo: "Ingreso de Inventario",
        codigo: codigo,
        nombre: productos[codigo].nombre,
        cantidad: cantidad,
        fecha: new Date().toLocaleString()
    });

    alert("Inventario actualizado con éxito");
    document.getElementById("inventoryQuantity").value = ""; 
    populateInventoryDropdown();
}

function logout() {
    hideAllSections();
    document.getElementById("login").style.display = "block";
}

function hidePreview() {
    document.getElementById("previewSection").style.display = "none";
}
