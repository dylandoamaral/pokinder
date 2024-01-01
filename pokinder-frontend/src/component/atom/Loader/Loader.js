import BeatLoader from "react-spinners/BeatLoader";

function Loader({ loading = false }) {
  return (
    <BeatLoader
      cssOverride={{ alignSelf: "center" }}
      loading={loading}
      color="#fff"
      aria-label="Loading Spinner"
    />
  );
}

export default Loader;
