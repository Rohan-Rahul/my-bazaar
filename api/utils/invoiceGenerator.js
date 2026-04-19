const PDFDocument = require('pdfkit');

const generateInvoiceBuffer = (orderData, razorpay_order_id) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(25).text('My Bazaar', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Order Invoice', { align: 'center' });
      doc.moveDown();

      // Order Info
      doc.fontSize(12);
      doc.text(`Order ID: ${razorpay_order_id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text('----------------------------------------------------');
      doc.moveDown();

      // Shipping Address
      doc.text('Shipping Address:');
      doc.text(orderData.shippingAddress.address);
      doc.text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}`);
      doc.text(orderData.shippingAddress.country);
      doc.moveDown();
      doc.text('----------------------------------------------------');
      doc.moveDown();

      // Items
      doc.text('Items:', { underline: true });
      doc.moveDown(0.5);
      
      orderData.orderItems.forEach(item => {
        const optionStr = item.selectedOption ? `(Size: ${item.selectedOption})` : '';
        const colorStr = item.selectedColor ? `(Color: ${item.selectedColor})` : '';
        doc.text(`${item.title} x ${item.quantity} ${optionStr} ${colorStr}`);
        doc.text(`Price: Rs. ${item.price * item.quantity}`, { align: 'right' });
        doc.moveDown(0.5);
      });

      doc.text('----------------------------------------------------');
      doc.moveDown();
      
      // Total
      doc.fontSize(16).text(`Total Paid: Rs. ${orderData.totalPrice}`, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoiceBuffer;