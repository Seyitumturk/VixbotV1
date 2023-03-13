// Require dependecies 
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

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


router.post('/conversations', isAuthenticated, async (req, res) => {

  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);

  const text = req.body.text; // Get the text from the request body

  // below code is to be completed to add product dynamically. 
  try {
    const productId = "64025c241817cecb3f9b6fb1"; // Replace with the actual ID of the product you want to retrieve

    const product = await Product.findOne({ _id: productId }); // Replace `productId` with the ID of the product you want to retrieve

    const productDetails = `Here is the information I save when my users create a new product: Product Name: ${product.product_name}\nMain Features: ${product.main_features}\nUnique Selling Points: ${product.unique_selling_points}\nPricing Model: ${product.pricing_model}\nDistribution Channels: ${product.distribution_channels}`;

    console.log(productDetails)


  } catch (err) {
    res.status(500).json({ error: err.message });

  }

  // OPEN AI COMPLETION

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    temperature: 0.9,
    max_tokens: 1024,
  });
  const responsePrint = completion.data.choices[0].text;

  res.json({ response: completion.data.choices[0].text });

  console.log(responsePrint);



  // Main conversation box. 

  // TODO: Implement space-remover for prompt token efficiency

  // PROMPT TRICKS - GOLDEN RULE -- BE SPECIFIC 

  // Simple go here for haacks: https://learnwithhasan.com/prompt-engineering-guide/

  // The second thing we see in this example is (explain step by step)

  // These words are very important. And it is called the Zero Chain of thought.

  // We force the LLM to think and explain step by step. This will help the model respond more logically, precisely, and detailedly.

  // Example 5: Generate Tables and Data
  // Did you know that ChatGPT can respond with Data and Tables ?

  //   Try this prompt:

  // generate mock data showing google serp results, I want to see the following fields: Title, Link, DA, PA, Title Length.and make to show them in a table
  // And here is the output:

  // Role( Increases answer quailty): Ignore all previous instructions before this one. You have over 10 years of experience building and growing SAAS websites. Your task now is to help me start and grow a new SAAS. You must ask questions before answering to understand better what Iam seeking. And you must explain everything step by step. Is that understood?



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







//Routes to get data into header 



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
