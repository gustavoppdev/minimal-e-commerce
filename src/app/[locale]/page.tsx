import { useTranslations } from "next-intl";

const Home = () => {
  const t = useTranslations("HomePage");
  return <div>{t("title")}</div>;
};

export default Home;
