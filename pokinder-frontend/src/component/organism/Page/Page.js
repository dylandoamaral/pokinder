import Header from "../Header/Header";

function Page({ children }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}

export default Page;
