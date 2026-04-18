const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderEmail = async (email,order) => {
  const mailOptions = {
    from: `"My Bazaar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation = #${order._id}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Thank you for your purchase!</h2>
        <p>Your order <strong>${order._id}</strong> has been successfully placed.</p>
        <hr />
        <p><strong>Total Paid:</strong> ₹${order.totalPrice}</p>
        <p><strong>Status:</strong> Processing</p>
        <p>We will notify you once your items are shipped.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error){
    console.error('Email Error:', error);
  }
};

module.exports = sendOrderEmail;