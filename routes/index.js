// Require dependecies
const express = require('express');
const router = express.Router();

const axios = require('axios');

const Product = require('../models/Products');
const Template = require('../models/Templates');

const mountRegisterRoutes = require('../features/register/routes');
const mountLoginRoutes = require('../features/login/routes');
const mountLogoutRoutes = require('../features/logout/routes');
const mountResetPasswordRoutes = require('../features/reset-password/routes');
const mountProfileRoutes = require('../features/profile/routes');


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);



// Authentication middleware to check if a user is logged in before proceeding to requested route
function isAuthenticated(req, res, next) {
  if (req.user && req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}
router.get('/questions', (req, res) => {
  // Render the questionnaire page
  res.render('pages/questions');
});

// GET routes
router.get('/', isAuthenticated, (req, res) => {  // Render dashboard page if user is logged in
  res.render('pages/dashboard');
});
router.get('/icons', isAuthenticated, (req, res) => {  // Render icons page if user is logged in
  res.render('pages/icons');
});
router.get('/maps', isAuthenticated, (req, res) => {  // Render maps page if user is logged in
  res.render('pages/maps');
});
router.get('/tables', isAuthenticated, (req, res) => {  // Render tables page if user is logged in
  res.render('pages/tables');
});




// Openai Routes

router.get('/conversations', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user._id }); // Retrieve the products from the database
    const selectedProduct = 'New Product';
    const selectedTemplate = 'New Template'; // Replace this with the selected product name
    res.render('pages/conversations', { products, selectedProduct, selectedTemplate }); // Pass the products variable to the conversations.ejs file
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/create-product', isAuthenticated, async (req, res) => {
  try {
    const productData = req.body;

    // Create a new product object with the request data
    const product = new Product({
      user_id: req.user._id,
      product_name: productData.product_name,
      main_features: productData.main_features,
      unique_selling_points: productData.unique_selling_points,
      pricing_model: productData.pricing_model,
      distribution_channels: productData.distribution_channels,
    });

    // Save the product to the database
    const result = await product.save();

    // Render the product card template with the new product data
    res.render('partials/product-card', { product: result }, (err, html) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to render product card template' });
      } else {
        // Send the product card HTML back to the client
        res.send(html);
      }
    });
  } catch (err) {
    console.error(err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ error: errors });
    } else {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
});
//});, Now help me achieve following with code, : when i click on the export to word button it will display a menu of other export options like pdf, and 3 more that you suggest, the menu will expand at the bottom of the prompt container, and user can toggle on off and choose from it, for now just implement this with appropriate icons for your export suggestions. And also one thing I want you to fix is , when the bot response is written in the prompt container box, it appears on top of the export icon/menu, and I want to display the text inside another div inside the prompt content card and want that div to have a header div and body div and store the text content in there and scroll just that div and keep the menu/export to word icon at the bottom static. Help me achieve this please, by adjusting my code. 

router.post('/conversations', isAuthenticated, async (req, res) => {

  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);

  const text = req.body.text;

  const productId = "6410cf5dbcedb3bf3b42ec07"; // Replace with the actual ID of the product you want to retrieve dynamically.
  const product = await Product.findOne({ _id: productId });
  const productDetails = `Here is the information I save when my users create a new product: Product Name: ${product.product_name}\nMain Features: ${product.main_features}\nUnique Selling Points: ${product.unique_selling_points}\nPricing Model: ${product.pricing_model}\nDistribution Channels: ${product.distribution_channels}`;
  const tone = "Professional"
  const role = "A senior exectuive at the company that is brainstorming on improving this product."
  const optimizeFor = "Giving stunningly good product improvement suggestions, and overall sucess of the product at hand."


  const promptBody = `${productDetails}. Take the following details to context, don't take it as the my question:  Optimize for ${optimizeFor}, Reply in the tone of: ${tone}, When answering consider your role as: ${role},  At the end of each prompt say done.  Now answer my following questions and requests about this product using the context. Here is the question: ${text}.`

  console.log(promptBody)


  const apiKeyy = "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";
  const endpointUrl = 'https://api.openai.com/v1/chat/completions';



  const requestBody = {

    "model": "gpt-3.5-turbo",
    "messages": [{ "role": "user", "content": `${promptBody}` }],
  };

  const requestHeaders = {

    'Content-Type': 'application/json',
    'Authorization': ` Bearer ${apiKeyy}`
  };

  axios.post(endpointUrl, requestBody, { headers: requestHeaders })
    .then(response => {
      const botMessage = response.data.choices[0].message.content;
      console.log(botMessage)
      res.status(200).json({ response: botMessage });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: error });
    });
});

//Product Route

router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user._id });
    res.render('pages/products', { products: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

//Template Route

router.get('/templates', isAuthenticated, (req, res) => {  // Render maps page if user is logged in
  res.render('pages/templates');
});
router.post('/create-template', isAuthenticated, async (req, res) => {
  try {
    const templateData = req.body;

    // Create a new template object with the request data
    const template = new Template({
      user_id: req.user._id,
      template_name: templateData.product_name,
      main_feature: templateData.main_feature,
      unique_selling_points: templateData.unique_selling_points,
      pricing_model: templateData.pricing_model,
      distribution_channels: templateData.distribution_channels,
    });

    // Save the template to the database
    const result = await template.save();

    // Render the template card template with the new template data
    res.render('partials/template-card', { template: result }, (err, html) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to render template-card template' });
      } else {
        // Send the template card HTML back to the client
        res.send(html);
      }
    });
  } catch (err) {
    console.error(err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ error: errors });
    } else {
      res.status(500).json({ error: 'Failed to create template' });
    }
  }
});

//Routes to get data into header - this could be changed to.

router.post('/header-data', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user._id });
    res.render('partials/header-data', { products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Mount register, login, logout, reset password & profile routes
mountRegisterRoutes(router);
mountLoginRoutes(router);
mountLogoutRoutes(router, [isAuthenticated]);
mountResetPasswordRoutes(router);
mountProfileRoutes(router, [isAuthenticated]);

// export router object
module.exports = router;
