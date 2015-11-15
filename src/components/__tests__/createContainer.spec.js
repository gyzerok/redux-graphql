import test from 'tape';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised';
import React, { Component, PropTypes } from 'react';
import createContainer from '../createContainer';
import sd from 'skin-deep';
import {isFunction, pick, extend, merge, methods} from 'lodash';

global.document = {}; // https://github.com/facebook/react/issues/4019

class LoadingComponent extends Component {
  render() {
    return <p>Loading</p>;
  }
}
class TestComponent extends Component {
  render() {
    return <div></div>;
  }
}

function isolatedTest(options, fn){
  const defaultContext = {
    adaptor: {
      resolve: sinon.stub().returns(new Promise(() => {})),
      subscribe: sinon.stub().returns(() => {})
    },
    renderLoading: () => LoadingComponent
  };
  const Container = createContainer(TestComponent, options);
  return fn({ context: defaultContext, Container, options });
}

test('createContainer', { skip: true },  t => {
  t.plan(12);

  isolatedTest({ queries: sinon.stub(), initialArgs: { foo: 'foo' }},
    ({ context, options, Container }) => {
      t.ok(Component.isPrototypeOf(Container), "should return React.Component");
    }
  )

  isolatedTest({ queries: sinon.stub(), initialArgs: { foo: 'foo' }},
    ({ context, options, Container })=>{
      const { query, initialArgs } = options;
      const tree = sd.shallowRender(
        <Container {...context} />
      );
      t.ok(context.adapter.resolve.calledWith(queries, initialArgs), "should set initialArgs in uncommitted state");
      t.equal(tree.getRenderOutput().type, LoadingComponent, "should render <Loading/> if the query has not been fetched");
      t.ok(Component.isPrototypeOf(SmartComponent), "should return React.Component");
    }
  )

  isolatedTest({query: sinon.stub(), initialArgs: {foo: 'foo'}},
      ({context, options, SmartComponent})=>{
          context.adrenaline = extend(context.adrenaline, {
              performQuery: sinon.stub().resolves({query: 'foo', variables: {foo: 'bar'}}),
              selectState: sinon.stub().resolves({ blah: 'blah' })
          });
          const resolved = sd.shallowRender(
              <SmartComponent {...context} foo='foo' bar='bar' />
          );
          setTimeout(()=>{ // setState is async
              t.comment("- after resolving a query");
              const component = resolved.getRenderOutput();
              t.notEqual(component.type, LoadingComponent, "should not render <Loading/>");
              t.equal(component.type, AdrenalineConnector, "should render the <AdrenalineConnector/> for managing child state");
              t.ok(isFunction(component.props.children), "should pass a state slice rendering function to render the decorated component as child of <AdrenalineConnector/>")
              const decoratedComponent = component.props.children({props: {slice: 'slice'}});
              t.equal(decoratedComponent.type, TestComponent, "should render the decorated component when invoked with a state slice");
              t.equal(decoratedComponent.props.slice, 'slice', "should pass the state slice as props to the decorated component");
              t.isEquivalent(pick(decoratedComponent.props, 'foo', 'bar'), {foo: 'foo', bar: 'bar'}, "should pass other props through to the decorated component");
          });
      }
  );

  isolatedTest({query: sinon.stub(), variables: (props)=>{ return {call: props.call }}},
      ({context, options, SmartComponent})=>{
          context.adrenaline = extend(context.adrenaline, {
              performQuery: (store, query, variables)=> Promise.resolve({query, variables}),
              selectState: (store, query, {call}) => Promise.resolve({call})
          });
          const props = {
              call: 1
          };
          const tree = sd.shallowRender(<SmartComponent {...context} {...props} />);

          setTimeout(()=>{
              t.comment("- using 'variables' as a pure function of props");
              let adrenalineConnector = tree.getRenderOutput();
              t.isEquivalent(adrenalineConnector.props.variables, {call:1}, "should set variables to the passed props");
              props.call = 2;
              tree.reRender(<SmartComponent {...context} {...props} />);
              setTimeout(()=>{
                  adrenalineConnector = tree.getRenderOutput();
                  t.isEquivalent(adrenalineConnector.props.variables, {call:2}, "should update variables when the props change");
              });
          });
      }
  );
});
