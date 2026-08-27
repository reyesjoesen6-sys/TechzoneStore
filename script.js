/* =====================================================
   TECHZONE STORE JAVASCRIPT
===================================================== */


/*
   IMPORTANT:
   Replace this with your Google Apps Script Web App URL.
*/

const API_URL =
    "https://script.google.com/macros/s/AKfycbxgYIDSg7d9CL1x7hB2CvA-NvDq6Z5kgyu8Z7tcVkX4cDPNcJm6ClSO7gS7QTho7dEs0w/exec";


let products = [];

let currentUser = null;


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDate();

        setInterval(
            updateDate,
            1000
        );


        const savedUser =
            localStorage.getItem(
                "techzoneUser"
            );


        if (savedUser) {

            currentUser =
                JSON.parse(
                    savedUser
                );

            showApplication();

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const username =
                document
                    .getElementById(
                        "username"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "password"
                    )
                    .value;


            const message =
                document
                    .getElementById(
                        "loginMessage"
                    );


            message.textContent =
                "Checking account...";


            fetch(
                API_URL +
                "?action=login" +
                "&username=" +
                encodeURIComponent(username) +
                "&password=" +
                encodeURIComponent(password)
            )

            .then(
                response =>
                    response.json()
            )

            .then(
                data => {

                    if (
                        data.success
                    ) {

                        currentUser = {

                            username:
                                data.username,

                            role:
                                data.role

                        };


                        localStorage.setItem(

                            "techzoneUser",

                            JSON.stringify(
                                currentUser
                            )

                        );


                        message.textContent =
                            "";


                        showApplication();

                    } else {

                        message.textContent =
                            data.message;

                    }

                }
            )

            .catch(
                error => {

                    console.error(
                        error
                    );

                    message.textContent =
                        "Unable to connect to Google Sheets.";

                }
            );

        }
    );


/* =====================================================
   SHOW APP
===================================================== */

function showApplication() {

    document
        .getElementById(
            "loginPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "app"
        )
        .classList.remove(
            "hidden"
        );


    if (currentUser) {

        document
            .getElementById(
                "loggedUser"
            )
            .textContent =
            currentUser.username;

    }


    loadProducts();

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    if (
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        "techzoneUser"
    );


    currentUser = null;

    products = [];


    document
        .getElementById(
            "app"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "loginPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "loginForm"
        )
        .reset();

}


/* =====================================================
   PASSWORD
===================================================== */

function togglePassword() {

    const password =
        document.getElementById(
            "password"
        );


    const icon =
        document.getElementById(
            "eyeIcon"
        );


    if (
        password.type ===
        "password"
    ) {

        password.type =
            "text";

        icon.classList.remove(
            "fa-eye"
        );

        icon.classList.add(
            "fa-eye-slash"
        );

    } else {

        password.type =
            "password";

        icon.classList.remove(
            "fa-eye-slash"
        );

        icon.classList.add(
            "fa-eye"
        );

    }

}


/* =====================================================
   DATE
===================================================== */

function updateDate() {

    const date =
        new Date();


    document
        .getElementById(
            "currentDate"
        )
        .textContent =

        date.toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

function loadProducts() {

    fetch(
        API_URL +
        "?action=getProducts"
    )

    .then(
        response =>
            response.json()
    )

    .then(
        data => {

            if (
                data.success
            ) {

                products =
                    data.products || [];


                refreshAll();

            } else {

                showToast(
                    "Failed to load inventory."
                );

            }

        }
    )

    .catch(
        error => {

            console.error(
                error
            );

            showToast(
                "Unable to connect to Google Sheets."
            );

        }
    );

}


/* =====================================================
   REFRESH
===================================================== */

function refreshAll() {

    updateDashboard();

    renderInventory();

    updateCategoryFilter();

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) => {

                return total +
                    Number(
                        product.quantity || 0
                    );

            },
            0
        );


    const lowStock =
        products.filter(
            product => {

                return (

                    Number(
                        product.quantity
                    ) > 0 &&

                    Number(
                        product.quantity
                    ) <=

                    Number(
                        product.reorderLevel
                    )

                );

            }
        ).length;


    const inventoryValue =
        products.reduce(
            (total, product) => {

                return total +

                    Number(
                        product.price || 0
                    ) *

                    Number(
                        product.quantity || 0
                    );

            },
            0
        );


    document
        .getElementById(
            "totalProducts"
        )
        .textContent =
        totalProducts;


    document
        .getElementById(
            "totalStock"
        )
        .textContent =
        totalStock;


    document
        .getElementById(
            "lowStock"
        )
        .textContent =
        lowStock;


    document
        .getElementById(
            "inventoryValue"
        )
        .textContent =
        formatCurrency(
            inventoryValue
        );


    renderRecentInventory();

}


/* =====================================================
   RECENT INVENTORY
===================================================== */

function renderRecentInventory() {

    const tbody =
        document.getElementById(
            "recentInventoryBody"
        );


    tbody.innerHTML = "";


    products
        .slice()
        .reverse()
        .slice(0,5)
        .forEach(
            product => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        <span class="product-name">
                            ${escapeHtml(product.name)}
                        </span>
                    </td>

                    <td>
                        ${escapeHtml(product.category)}
                    </td>

                    <td>
                        ${formatCurrency(product.price)}
                    </td>

                    <td>
                        ${product.quantity}
                    </td>

                    <td>
                        ${statusBadge(
                            getProductStatus(product)
                        )}
                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );

}


/* =====================================================
   INVENTORY TABLE
===================================================== */

function renderInventory(
    list = products
) {

    const tbody =
        document.getElementById(
            "inventoryBody"
        );


    tbody.innerHTML = "";


    if (
        list.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;padding:40px;"
                >

                    No products found.

                </td>

            </tr>

        `;

        return;

    }


    list.forEach(
        product => {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                getProductStatus(
                    product
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHtml(product.id)}
                    </strong>
                </td>

                <td>
                    <span class="product-name">
                        ${escapeHtml(product.name)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(product.category)}
                </td>

                <td>
                    ${formatCurrency(product.price)}
                </td>

                <td>
                    ${product.quantity}
                </td>

                <td>
                    ${product.reorderLevel}
                </td>

                <td>
                    ${statusBadge(status)}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="action edit"
                            onclick="openEditModal('${product.id}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="action delete"
                            onclick="deleteProduct('${product.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}


/* =====================================================
   PRODUCT STATUS
===================================================== */

function getProductStatus(
    product
) {

    const quantity =
        Number(
            product.quantity || 0
        );


    const reorder =
        Number(
            product.reorderLevel || 0
        );


    if (
        quantity <= 0
    ) {

        return "Out of Stock";

    }


    if (
        quantity <= reorder
    ) {

        return "Low Stock";

    }


    return "In Stock";

}


/* =====================================================
   STATUS BADGE
===================================================== */

function statusBadge(
    status
) {

    let className =
        "in-stock";


    if (
        status === "Low Stock"
    ) {

        className =
            "low-stock";

    }


    if (
        status === "Out of Stock"
    ) {

        className =
            "out-stock";

    }


    return `

        <span class="status ${className}">

            ${status}

        </span>

    `;

}


/* =====================================================
   CURRENCY
===================================================== */

function formatCurrency(
    value
) {

    return new Intl.NumberFormat(
        "en-PH",
        {
            style: "currency",
            currency: "PHP"
        }
    ).format(
        Number(value || 0)
    );

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

function updateCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );


    const current =
        select.value;


    const categories =
        [
            ...new Set(
                products.map(
                    product =>
                        product.category
                )
            )
        ]
        .sort();


    select.innerHTML = `

        <option value="">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            select.appendChild(
                option
            );

        }
    );


    select.value =
        current;

}


/* =====================================================
   FILTER
===================================================== */

function filterInventory() {

    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase()
            .trim();


    const category =
        document
            .getElementById(
                "categoryFilter"
            )
            .value;


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const filtered =
        products.filter(
            product => {

                const text =

                    product.name +
                    " " +
                    product.id +
                    " " +
                    product.category;


                const searchMatch =
                    text
                        .toLowerCase()
                        .includes(search);


                const categoryMatch =
                    !category ||
                    product.category === category;


                const statusMatch =
                    !status ||
                    getProductStatus(
                        product
                    ) === status;


                return (
                    searchMatch &&
                    categoryMatch &&
                    statusMatch
                );

            }
        );


    renderInventory(
        filtered
    );

}


/* =====================================================
   ADD PRODUCT
===================================================== */

document
    .getElementById(
        "productForm"
    )
    .addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const product = {

                id:
                    "TZ-" +
                    Date.now()
                        .toString()
                        .slice(-6),

                name:
                    document
                        .getElementById(
                            "productName"
                        )
                        .value
                        .trim(),

                category:
                    document
                        .getElementById(
                            "productCategory"
                        )
                        .value,

                price:
                    Number(
                        document
                            .getElementById(
                                "productPrice"
                            )
                            .value
                    ),

                quantity:
                    Number(
                        document
                            .getElementById(
                                "productQuantity"
                            )
                            .value
                    ),

                reorderLevel:
                    Number(
                        document
                            .getElementById(
                                "reorderLevel"
                            )
                            .value
                    ),

                supplier:
                    document
                        .getElementById(
                            "supplier"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "productDescription"
                        )
                        .value
                        .trim()

            };


            postData(
                "addProduct",
                product
            );

        }
    );


/* =====================================================
   POST DATA
===================================================== */

function postData(
    action,
    data
) {

    const form =
        document.createElement(
            "form"
        );


    form.method =
        "POST";


    form.action =
        API_URL;


    form.target =
        "hiddenFrame";


    const fields = {

        action:
            action,

        id:
            data.id || "",

        name:
            data.name || "",

        category:
            data.category || "",

        price:
            data.price || 0,

        quantity:
            data.quantity || 0,

        reorderLevel:
            data.reorderLevel || 0,

        supplier:
            data.supplier || "",

        description:
            data.description || ""

    };


    Object.keys(fields)
        .forEach(
            key => {

                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "hidden";


                input.name =
                    key;


                input.value =
                    fields[key];


                form.appendChild(
                    input
                );

            }
        );


    document.body.appendChild(
        form
    );


    form.submit();


    form.remove();


    setTimeout(
        function() {

            loadProducts();

        },
        1500
    );


    if (
        action === "addProduct"
    ) {

        showToast(
            "Product added successfully."
        );


        resetProductForm();


        showPageById(
            "inventoryPage"
        );

    }


    if (
        action === "updateProduct"
    ) {

        showToast(
            "Product updated successfully."
        );


        closeEditModal();

    }

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function openEditModal(
    id
) {

    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {
        return;
    }


    document
        .getElementById(
            "editId"
        )
        .value =
        product.id;


    document
        .getElementById(
            "editName"
        )
        .value =
        product.name;


    document
        .getElementById(
            "editCategory"
        )
        .value =
        product.category;


    document
        .getElementById(
            "editPrice"
        )
        .value =
        product.price;


    document
        .getElementById(
            "editQuantity"
        )
        .value =
        product.quantity;


    document
        .getElementById(
            "editReorder"
        )
        .value =
        product.reorderLevel;


    document
        .getElementById(
            "editSupplier"
        )
        .value =
        product.supplier;


    document
        .getElementById(
            "editDescription"
        )
        .value =
        product.description;


    document
        .getElementById(
            "editModal"
        )
        .classList.add(
            "show"
        );

}


/* =====================================================
   CLOSE EDIT
===================================================== */

function closeEditModal() {

    document
        .getElementById(
            "editModal"
        )
        .classList.remove(
            "show"
        );

}


/* =====================================================
   UPDATE PRODUCT
===================================================== */

document
    .getElementById(
        "editProductForm"
    )
    .addEventListener(
        "submit",
        function(e) {

            e.preventDefault();


            const product = {

                id:
                    document
                        .getElementById(
                            "editId"
                        )
                        .value,

                name:
                    document
                        .getElementById(
                            "editName"
                        )
                        .value,

                category:
                    document
                        .getElementById(
                            "editCategory"
                        )
                        .value,

                price:
                    Number(
                        document
                            .getElementById(
                                "editPrice"
                            )
                            .value
                    ),

                quantity:
                    Number(
                        document
                            .getElementById(
                                "editQuantity"
                            )
                            .value
                    ),

                reorderLevel:
                    Number(
                        document
                            .getElementById(
                                "editReorder"
                            )
                            .value
                    ),

                supplier:
                    document
                        .getElementById(
                            "editSupplier"
                        )
                        .value,

                description:
                    document
                        .getElementById(
                            "editDescription"
                        )
                        .value

            };


            postData(
                "updateProduct",
                product
            );

        }
    );


/* =====================================================
   DELETE
===================================================== */

function deleteProduct(
    id
) {

    const product =
        products.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!product) {
        return;
    }


    if (
        !confirm(
            `Delete "${product.name}"?`
        )
    ) {

        return;

    }


    const form =
        document.createElement(
            "form"
        );


    form.method =
        "POST";


    form.action =
        API_URL;


    form.target =
        "hiddenFrame";


    const action =
        document.createElement(
            "input"
        );


    action.type =
        "hidden";


    action.name =
        "action";


    action.value =
        "deleteProduct";


    form.appendChild(
        action
    );


    const idInput =
        document.createElement(
            "input"
        );


    idInput.type =
        "hidden";


    idInput.name =
        "id";


    idInput.value =
        id;


    form.appendChild(
        idInput
    );


    document.body.appendChild(
        form
    );


    form.submit();


    form.remove();


    showToast(
        "Product deleted successfully."
    );


    setTimeout(
        loadProducts,
        1500
    );

}


/* =====================================================
   RESET FORM
===================================================== */

function resetProductForm() {

    document
        .getElementById(
            "productForm"
        )
        .reset();


    document
        .getElementById(
            "reorderLevel"
        )
        .value = 5;

}


/* =====================================================
   NAVIGATION
===================================================== */

function showPage(
    pageId,
    button
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            page => {

                page.classList.remove(
                    "active-page"
                );

            }
        );


    document
        .getElementById(
            pageId
        )
        .classList.add(
            "active-page"
        );


    document
        .querySelectorAll(
            ".menu"
        )
        .forEach(
            menu => {

                menu.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    const titles = {

        dashboardPage:
            "Dashboard",

        inventoryPage:
            "Inventory",

        addProductPage:
            "Add Product"

    };


    document
        .getElementById(
            "pageTitle"
        )
        .textContent =
        titles[pageId];


    if (
        window.innerWidth <= 768
    ) {

        document
            .getElementById(
                "sidebar"
            )
            .classList.remove(
                "show"
            );

    }

}


function showPageById(
    pageId
) {

    const buttons =
        document.querySelectorAll(
            ".menu"
        );


    let targetButton = null;


    buttons.forEach(
        button => {

            const onclick =
                button.getAttribute(
                    "onclick"
                );


            if (
                onclick &&
                onclick.includes(
                    pageId
                )
            ) {

                targetButton =
                    button;

            }

        }
    );


    showPage(
        pageId,
        targetButton
    );

}


/* =====================================================
   MOBILE
===================================================== */

function toggleSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        .classList.toggle(
            "show"
        );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    document
        .getElementById(
            "toastMessage"
        )
        .textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function() {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
