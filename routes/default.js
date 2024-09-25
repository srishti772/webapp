const express = require('express');
const router = express.Router();

router.all('*', async (req, res) => {
  
    console.log('default route');
    
    return res.status(404).end();

  
});


module.exports = router;
