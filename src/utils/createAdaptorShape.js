export default function createAdaptorShape(PropTypes) {
  return PropTypes.shape({
    resolve: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
    shouldComponentUpdate: PropTypes.func.isRequired,
  });
}
