import request from 'superagent';
import constants from '../../constants';

export function loadCategories(params, query, readyFn) {
  return function(dispatch) {
    dispatch({type:constants.LOAD_CATEGORIES});
    request.get(constants.API_URL_DEV+'categories').end( (err, resp) => {
      dispatch({type:constants.LOAD_CATEGORIES_SUCCESS, items:resp.body});
      if (typeof readyFn === 'function') readyFn();
    });
  }
}