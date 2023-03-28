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

//Template Routes



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



// Product Routes

router.get('/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user._id });
    res.render('pages/products', { products: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve products' });
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










// Route to get products for convesations endpoint

router.get('/get_products', isAuthenticated, async (req, res) => {
  const products = await Product.find({ user_id: req.user._id });
  res.json(products);
});

// Route to set products for convesations endpoint

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




router.get('/get_businesses', isAuthenticated, async (req, res) => {
  const businesses = await Business.find({ user_id: req.user._id });
  res.json(businesses);
});

router.post('/set_selected_business', isAuthenticated, async (req, res) => {
  try {
    const businessId = req.body.businessId;
    req.session.selectedBusinessId = businessId;
    res.status(200).json({ message: 'Business ID updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to set selected business ID' });
  }
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
  // User Prompt Text
  const text = req.body.text;

  // Retrieve needed data for prompt from database

  console.log("Received POST request on /conversations");

  const businessId = req.session.selectedBusinessId;
  const business = await Business.findOne({ _id: businessId });
  console.log(businessId)



  const productId = req.session.selectedProductId;
  const product = await Product.findOne({ _id: productId });
  console.log(productId)


  //Prompt Logic Starts
  // Implementing System message option add a good degree of steeriblity over what they want. (Sam Altman)

  const businessDetails = `
  Here is my business details:
    Business Name: ${business.name}
    Industry: ${business.industry}
    Occupation: ${business.occupation}
    Stands For: ${business.stands_for}
    Communication Tone: ${business.communication_tone}
    Main Competitors: ${business.main_competitors}
    Strengths: ${business.strengths}
    Weaknesses: ${business.weaknesses}
    Typical Growth: ${business.typical_growth}
    Team Size and Structure: ${business.teamsize_and_structure}
    Company Culture: ${business.company_culture}
    Main Business Goals: ${business.main_bussiness_goals}
  `;
  const productDetails = `Here is the information I save when my users create a new product: Product Name: ${product.product_name}\nMain Features: ${product.main_features}\nUnique Selling Points: ${product.unique_selling_points}\nPricing Model: ${product.pricing_model}\nDistribution Channels: ${product.distribution_channels}`;
  const optimizeFor = "Giving stunningly good product improvement suggestions, and overall sucess of the product at hand."


  const promptBody = `Business: ${businessDetails}, ${productDetails}. Take the following details to context, don't take it as my question:  Optimize for ${optimizeFor}.  Now answer my following questions and requests about this product using the context. Here is the question: ${text}.`

  console.log(promptBody)


  const apiKeyy = "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";
  const endpointUrl = 'https://api.openai.com/v1/chat/completions';



  const requestBody = {

    "model": "gpt-3.5-turbo",
    "temperature": 1.0,
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
  const {
    name,
    industry,
    occupation,
    stands_for,
    communication_tone,
    main_competitors,
    strengths,
    weaknesses,
    typical_growth,
    teamsize_and_structure,
    company_culture,
    main_bussiness_goals,
    gpt_business_summary
  } = req.body;

  const newBusiness = new Business({
    user_id: req.user.id,
    name,
    industry,
    occupation,
    stands_for,
    communication_tone,
    main_competitors,
    strengths,
    weaknesses,
    typical_growth,
    teamsize_and_structure,
    company_culture,
    main_bussiness_goals,
    gpt_business_summary
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




// Mount register, login, logout, reset password & profile routes
mountRegisterRoutes(router);
mountLoginRoutes(router);
mountLogoutRoutes(router, [isAuthenticated]);
mountResetPasswordRoutes(router);
mountProfileRoutes(router, [isAuthenticated]);

// export router object
module.exports = router;
