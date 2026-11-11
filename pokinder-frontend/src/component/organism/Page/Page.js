import styles from "./Page.module.css";

function Page({
  name,
  description,
  canonical,
  noindex,
  children,
  overflow = "none",
  scrollRef = null,
  onScrollFinish = () => {},
}) {
  const title = `${name} | Pokinder`;
  const siteUrl = "https://pokinder.com";
  const pageUrl = canonical || `${siteUrl}${window.location.pathname}`;

  function onScroll(e) {
    const threshold = 50 / 100;
    const scrollPosition = e.target.scrollHeight - e.target.scrollTop;
    const thresholdPosition = e.target.clientHeight * (1 + threshold);

    if (scrollPosition <= thresholdPosition) {
      onScrollFinish();
    }
  }

  return (
    <>
      <title>{title}</title>
    
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
  
      <link rel="canonical" href={pageUrl} />
    
      <meta property="og:site_name" content="Pokinder" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
    
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    
      <main
        style={{ overflow: overflow, display: overflow === "none" ? "grid" : "block" }}
        className={styles.main}
        onScroll={onScroll}
        ref={scrollRef}
      >
        {children}
      </main>
    </>
  );
}

export default Page;
