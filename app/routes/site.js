import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Provider} from 'react-redux';
import {RoutingContext, match} from 'react-router';
import {Map} from 'immutable';
import createLocation from 'history/lib/createLocation';
import {makeStore} from '../scripts/store';
import iso from '../scripts/isomorphic';
import {routes} from '../scripts/routes';
import pageTitle from '../scripts/pageTitle';

const router = express.Router();

router.get('*', function(req, res, next) {

  function renderError(status, message) {
    res.status(status);
    res.render('error', {
      message: message,
      error: {}
    });
  }

  function renderSuccess(markup, initialState) {
    res.render('home', {
      markup: markup,
      initialState: encodeURI(JSON.stringify(initialState)),
      title: initialState.title || pageTitle.getDefault()
    });
  }

  function getMarkupAsString(renderProps, store) {
    let initialElement = (
      <RoutingContext {...renderProps} />
    );
    let markup = ReactDOMServer.renderToString(
      <Provider store={store}>
        {initialElement}
      </Provider>
    );
    return markup;
  }

  let location = Object.assign({}, createLocation(req.originalUrl), {params:req.params, query:req.query});
  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (error) {
      renderError(500, error.message);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      // initialize isomorphic methods and pageTitle management
      let store = makeStore();
      iso.init();
      pageTitle.init(store);
      // generate markup based on route. if any components require async data they will subscribe to iso object.
      let markup = getMarkupAsString(renderProps, store);
      // if there were subscribers, set up a doAsyncFns callback to regenerate markup once async loads are complete
      if (iso.hasAsyncFns()) {
        iso.doAsyncFns(function(){
          renderSuccess(getMarkupAsString(renderProps, store), store.getState().toJS());
        });
      }
      // else if no components require async loads, render final markup
      else {
        renderSuccess(markup, store.getState().toJS());
      }
    } else {
      renderError(404, 'Not Found');
    }
  });

});

export {router as default};