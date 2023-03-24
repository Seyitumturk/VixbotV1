// Require dependecies
const express = require('express');
const router = express.Router();

const axios = require('axios');

const Product = require('../models/Products');
const Template = require('../models/Templates');
const Business = require('../models/businesses');// Require your Business and User models at the top of your routes or controller file
const User = require('../models/Users');

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





//Product Route generic

router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user._id });
    res.render('pages/products', { products: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

router.get('/get_products', isAuthenticated, async (req, res) => {
  const products = await Product.find({});
  res.json(products);
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

// Route to get products for convesations endpoint 

router.post('/set_selected_product', isAuthenticated, async (req, res) => {
  try {
    const productId = req.body.productId;
    req.session.selectedProductId = productId;
    res.status(200).json({ message: 'Product ID updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set selected product ID' });
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

router.get('/get_templates', isAuthenticated, async (req, res) => {
  const templates = await Template.find({ user_id: req.user._id });
  res.json(templates);
});













// Openai Routes

router.get('/conversations', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const businesses = await Business.find({ user_id: user._id });
    const chosenBusinessId = req.query.business_id;
    const chosenBusiness = businesses.find(business => business._id.toString() === chosenBusinessId);

    const products = await Product.find({ user_id: req.user._id }); // Retrieve the products from the database
    const templates = 'New Template'; // Replace this with the selected product name

    // Pass the businesses, products, and chosenBusiness variables to the conversations.ejs file
    res.render('pages/conversations', { businesses, products, chosenBusiness });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/conversations', isAuthenticated, async (req, res) => {

  const text = req.body.text;


  const chosenBusinessId = req.body.chosenBusinessId;
  const chosenBusiness = await Business.findById(chosenBusinessId);




  const productId = req.session.selectedProductId;
  console.log(productId)
  const product = await Product.findOne({ _id: productId });



  const templateId = req.session.selectedTemplateId;
  console.log(productId)
  const template = await Product.findOne({ _id: templateId });



  const productDetails = `Here is the information I save when my users create a new product: Product Name: ${product.product_name}\nMain Features: ${product.main_features}\nUnique Selling Points: ${product.unique_selling_points}\nPricing Model: ${product.pricing_model}\nDistribution Channels: ${product.distribution_channels}`;
  const tone = "Professional"
  const role = "A senior exectuive at the company that is brainstorming on improving this product."
  const optimizeFor = "Giving stunningly good product improvement suggestions, and overall sucess of the product at hand."


  const promptBody = `Business: ${chosenBusiness.name}, ${productDetails}. Take the following details to context, don't take it as my question:  Optimize for ${optimizeFor}, Reply in the tone of: ${tone}, When answering consider your role as: ${role},  At the end of each prompt say done.  Now answer my following questions and requests about this product using the context. Here is the question: ${text}.`

  console.log(promptBody)


  const apiKeyy = "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";
  const endpointUrl = 'https://api.openai.com/v1/chat/completions';



  const requestBody = {

    "model": "gpt-3.5-turbo",
    "messages": [{ "role": "user", "content": `${promptBody}` }],
  };

  const requestHeaders = {

    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKeyy}`
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










// Onboarding 

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


router.get('/onboarding', ensureAuthenticated, (req, res) => {
  res.render('pages/onboarding');
});


router.post('/onboarding/create-business', ensureAuthenticated, async (req, res) => {
  const { name, industry, occupation /* other fields */ } = req.body;
  const newBusiness = new Business({
    user_id: req.user.id,
    name,
    industry,
    occupation,
    // Add other fields
  });

  try {
    await newBusiness.save();
    await User.findByIdAndUpdate(req.user.id, { $set: { onboarding_completed: true } });
    res.redirect('/conversations');
  } catch (err) {
    console.error(err);
    res.render('pages/conversations', { error: 'Failed to create the business. Please try again.' });
  }
});

router.post('/update-chosen-business', isAuthenticated, async (req, res) => {
  try {
    const chosenBusinessId = req.body.chosenBusinessId;
    // Update the user's session with the chosen business ID
    req.session.chosenBusinessId = chosenBusinessId;
    res.status(200).send('Chosen business updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating chosen business');
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
