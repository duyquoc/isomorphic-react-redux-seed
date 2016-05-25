import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import constants from '../../constants';
import {loadCategories} from './actions';
import filtersReducer from './reducer';

export class FilterItem extends React.Component {
  render() {
    const category = this.props.category;
    const sortObj = this.props.sortObj;
    const href = '/products/'+category.id;
    return (
      <Link className={this.props.className} href={href+sortObj.search} query={sortObj.query} to={href}>{category.name}</Link>
    );
  }
}

export class FiltersList extends React.Component {
  getSortObj() {
    const sort = this.props.sort;
    const sortObj = {str: '', search:'', query: {}};
    if (sort !== '') {
      sortObj.str = sort;
      sortObj.search = '?sort='+sort;
      sortObj.query = {sort:sort};
    }
    return sortObj;
  }
  render() {
    let items = [];
    const sortObj = this.getSortObj();
    const href = '/products/';
    const categoryId = this.props.categoryId;
    const allClassName = (categoryId === '') ? constants.SELECTED : '';
    this.props.categories.forEach(category => {
      let className = (parseInt(categoryId, 10) === category.id) ? constants.SELECTED : '';
      items.push(<FilterItem category={category} className={className} key={category.id} sortObj={sortObj} />);
    });
    return (
      <nav>
        <Link className={allClassName} href={href+sortObj.search} query={sortObj.query} to={href}>All Products</Link>
        {items}
      </nav>
    );
  }
}

FiltersList.needs = [loadCategories];
FiltersList.reducers = [filtersReducer];

function select(state) {
  state = state.toJS();
  return {
    categories: ((state.categories) ? state.categories.items : []),
    categoryId: ((state.products) ? state.products.categoryId : ''),
    sort: ((state.products) ? state.products.sort : '')
  };
}

export default connect(select)(FiltersList);