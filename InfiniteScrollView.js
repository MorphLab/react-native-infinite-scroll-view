/**
 * @flow
 */
'use strict';

let React = require('react-native');
let ScrollableMixin = require('react-native-scrollable-mixin');
let {
  PropTypes,
  ScrollView,
} = React;

let cloneReferencedElement = require('react-native-clone-referenced-element');

let DefaultLoadingIndicator = require('./DefaultLoadingIndicator');

let InfiniteScrollView = React.createClass({
  mixins: [ScrollableMixin],

  propTypes: {
    ...ScrollView.propTypes,
    distanceToLoadMore: PropTypes.number.isRequired,
    canLoadMore: PropTypes.bool.isRequired,
    isLoadingMore: PropTypes.bool.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    renderLoadingIndicator: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      distanceToLoadMore: 1000,
      canLoadMore: false,
      scrollEventThrottle: 100,
      renderLoadingIndicator: () => <DefaultLoadingIndicator />,
      renderScrollComponent: props => <ScrollView {...props} />,
    };
  },

  getScrollResponder(): ReactComponent {
    return this._scrollComponent.getScrollResponder();
  },

  setNativeProps(props) {
    this._scrollComponent.setNativeProps(props);
  },

  render() {
    if (this.props.isLoadingMore) {
      var loadingIndicator = React.cloneElement(
        this.props.renderLoadingIndicator(),
        { key: 'loading-indicator' },
      );
    }

    let {
      renderScrollComponent,
      ...props,
    } = this.props;
    Object.assign(props, {
      onScroll: this._handleScroll,
      children: [this.props.children, loadingIndicator],
    });

    return cloneReferencedElement(renderScrollComponent(props), {
      ref: component => { this._scrollComponent = component; },
    });
  },

  _handleScroll(event) {
    if (this.props.onScroll) {
      this.props.onScroll(event);
    }

    if (this.props.isLoadingMore || !this.props.canLoadMore) {
      return;
    }

    if (this._distanceFromEnd(event) < this.props.distanceToLoadMore) {
      this.props.onLoadMore();
    }
  },

  _distanceFromEnd(event): number {
    let {
      contentSize,
      contentInset,
      contentOffset,
      layoutMeasurement,
    } = event.nativeEvent;

    if (this.props.horizontal) {
      var contentLength = contentSize.width;
      var trailingInset = contentInset.right;
      var scrollOffset = contentOffset.x;
      var viewportLength = layoutMeasurement.width;
    } else {
      contentLength = contentSize.height;
      trailingInset = contentInset.bottom;
      scrollOffset = contentOffset.y;
      viewportLength = layoutMeasurement.height;
    }

    return contentLength + trailingInset - scrollOffset - viewportLength;
  },
});

module.exports = InfiniteScrollView;