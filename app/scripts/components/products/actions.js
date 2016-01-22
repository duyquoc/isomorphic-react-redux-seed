import request from 'superagent';
import constants from '../../constants';
import pageTitle from '../../pageTitle';

let productsReq = null;

export function getNormalizedProp(prop) {
  if (typeof prop === 'undefined') prop = '';
  return prop;
}

export function loadProducts(categoryId, sort) {
  return {
    async: function(dispatch, getState, readyFn) {
      categoryId = getNormalizedProp(categoryId);
      sort = getNormalizedProp(sort);
      if (productsReq !== null) productsReq.abort();
      dispatch({type:constants.LOAD_PRODUCTS, categoryId:categoryId, sort:sort});
      pageTitle.set(['Products', categoryId]);
      let url = constants.API_URL_DEV + 'products/' + categoryId;
      if (sort !== '') url = url + '?sort=' + sort;
      productsReq = request.get(url).end( (err, resp) => {
        dispatch({type:constants.LOAD_PRODUCTS_SUCCESS, items:resp.body});
        productsReq = null;
        readyFn();
      });
    }
  }
}