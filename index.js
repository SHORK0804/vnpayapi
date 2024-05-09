const shortid = require('shortid');
const sql = require('mssql');
const config = require('./config');

const getInvoiceData = async (userId) => {
    try {
        const currentUserQuery = `SELECT * FROM [User] WHERE userId = ${userId}`;

        const generateInvoiceID = () => {
            const invoiceID = shortid.generate();
            return invoiceID.toUpperCase();
        };

        const cart = document.querySelector('.totals'); // Sửa lệnh lấy cart element
        const cartProducts = document.getElementById('#product-name');

        const invoiceData = {
            invoiceID: generateInvoiceID(),
            userID: userId,
            products: [],
            dateTime: new Date().toLocaleString(),
            totalPrice: 0
        };

        for (const product of cartProducts) {
            const productName = product.getElementsByClassName('name')[0].textContent;
            const price = parseFloat(product.getElementsByClassName('price')[0].textContent); // Sửa lệnh lấy giá sản phẩm

            invoiceData.products.push({
                productName: productName,
                price: price,
            });

            invoiceData.totalPrice += price;
        }

        const invoiceContainer = document.createElement('div');
        const invoiceIDElement = document.createElement('p');
        invoiceIDElement.textContent = `Invoice ID: ${invoiceData.invoiceID}`;
        const userIDElement = document.createElement('p');
        userIDElement.textContent = `User ID: ${invoiceData.userID}`;
        const dateTimeElement = document.createElement('p');
        dateTimeElement.textContent = `Date and Time: ${invoiceData.dateTime}`;
        const totalPriceElement = document.createElement('p');
        totalPriceElement.textContent = `Total Price: ${invoiceData.totalPrice}`;

        invoiceContainer.appendChild(invoiceIDElement);
        invoiceContainer.appendChild(userIDElement);
        invoiceContainer.appendChild(dateTimeElement);

        const productListElement = document.createElement('ul');
        invoiceData.products.forEach((product) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Product Name: ${product.productName}, Pricing: ${product.price}`;
            productListElement.appendChild(listItem);
        });

        invoiceContainer.appendChild(productListElement);

        invoiceContainer.appendChild(totalPriceElement);

        document.body.appendChild(invoiceContainer);

        return invoiceData;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin hóa đơn từ cơ sở dữ liệu:', error);
        return null;
    }
};

const saveInvoiceToDatabase = async (invoiceData) => {
    try {
        await sql.connect(config);

        const query = `
            INSERT INTO Invoice (invoice_id, user_id, product_name, total_price, date)
            VALUES ('${invoiceData.invoiceID}', '${invoiceData.userID}', '${JSON.stringify(invoiceData.products)}', '${invoiceData.totalPrice}', '${invoiceData.dateTime}')
        `;
        await sql.query(query);

        console.log('Hóa đơn đã được lưu vào cơ sở dữ liệu');
    } catch (error) {
        console.error('Lỗi khi lưu hóa đơn vào cơ sở dữ liệu:', error);
    } finally {
        sql.close();
    }
};

const purchaseButton = document.querySelector('#purchaseButton'); // Thêm lệnh lấy nút Purchase

purchaseButton.addEventListener('click', async () => {
    const userId = 123; // Sửa userId thành giá trị thực tế

    const invoiceData = await getInvoiceData(userId);

    if (invoiceData) {
        await saveInvoiceToDatabase(invoiceData);
    }
});