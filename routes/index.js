// Require dependecies 
const express = require('express');
const router = express.Router();
const Product = require('../models/Products');

const mountRegisterRoutes = require('../features/register/routes');
const mountLoginRoutes = require('../features/login/routes');
const mountLogoutRoutes = require('../features/logout/routes');
const mountResetPasswordRoutes = require('../features/reset-password/routes');
const mountProfileRoutes = require('../features/profile/routes');




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

router.get('/conversations', isAuthenticated, (req, res) => {  // Render maps page if user is logged in
  res.render('pages/conversations');
});


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

router.post('/conversations', isAuthenticated, async (req, res) => {
  const text = req.body.text; // Get the text from the request body


  const generateResponse = async (prompt, temperature) => {
    try {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1024,
        temperature: temperature,
      });

      return response.data.choices[0].text;
    } catch (err) {
      console.error(err);
      return `An error occurred while generating the response: ${err.message}`;
    }
  };
  try {
    const response = await generateResponse(text, 0.7);
    res.json({ response: response });
    console.log(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

//Product Routes 


router.get('/products', isAuthenticated, (req, res) => {  // Render maps page if user is logged in
  res.render('pages/products');
});
// // Generate product summary using OpenAI
// const summary = await openai.createCompletion({
//   engine: 'text-davinci-003',
//   prompt: "Say summary is saved successfully",
//   maxTokens: 50,
//   temperature: 0.5,

// });

router.post('/create-product', async (req, res) => {

  // Get the form body. 
  const productData = req.body;



  try {
    // Save product data and summary to MongoDB
    const product = new Product({
      product_name: productData.product_name,
      main_features: productData.main_features,
      unique_selling_points: productData.unique_selling_points,
      pricing_model: productData.pricing_model,
      distribution_channels: productData.distribution_channels,
    });



    // Send back to the client in json format. 
    const result = await product.save();
    res.json(result);


  } catch (err) {
    console.log("hey");

    console.error(err);
    console.log(err.response.data); // log the response data

    res.status(500).json({ error: 'Failed to create product' });
  }
});


router.get('/templates', isAuthenticated, (req, res) => {  // Render maps page if user is logged in
  res.render('pages/templates');
});

// Mount register, login, logout, reset password & profile routes
mountRegisterRoutes(router);
mountLoginRoutes(router);
mountLogoutRoutes(router, [isAuthenticated]);
mountResetPasswordRoutes(router);
mountProfileRoutes(router, [isAuthenticated]);

// export router object
module.exports = router;
