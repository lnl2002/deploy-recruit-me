import IntroductionFour from "./components/introductionFour";
import IntroductionOne from "./components/IntroductionOne";
import IntroductionThree from "./components/IntroductionThree";
import IntroductionTwo from "./components/IntroductionTwo";

const Introduction = (): React.JSX.Element => {
  return (
    <>
      <IntroductionOne />
      <IntroductionTwo />
      <IntroductionThree />
      <IntroductionFour />
    </>
  );
};

export default Introduction;
