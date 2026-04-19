const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderEmail = async (email, order, pdfBuffer) => {
  //Payment Confirmation
  const confirmationMailOptions = {
    from: `"My Bazaar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - #${order._id}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Thank you for your purchase!</h2>
        <p>Your order <strong>${order._id}</strong> has been successfully placed.</p>
        <hr />
        <p><strong>Total Paid:</strong> ₹${order.totalPrice}</p>
        <p><strong>Status:</strong> Processing</p>
        <p>We will notify you once your items are shipped. A separate email containing your invoice has been sent to you.</p>
      </div>
    `
  };

  //Invoice Attachment
  const invoiceMailOptions = {
    from: `"My Bazaar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Invoice for Order #${order._id}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Order Invoice</h2>
        <p>Please find attached the official invoice for your recent order <strong>${order._id}</strong>.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `,
    attachments: [
      {
        filename: `invoice_${order._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(confirmationMailOptions);
    await transporter.sendMail(invoiceMailOptions);
    console.log(`Confirmation and Invoice emails sent to ${email}`);
  } catch (error){
    console.error('Email Error:', error);
  }
};

module.exports = sendOrderEmail;