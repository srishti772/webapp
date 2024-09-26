const setHeaders = (req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Access-Control-Allow-Origin', '*'); 
    res.set('Access-Control-Allow-METHODS', 'GET');  

    next();
  };
  
  module.exports = setHeaders;
  