import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationCard } from "../../components/learning/ui/Card";
import rockyWink from "../../../public/learningFolders/rockyWink.svg";
import friends from "../../../public/learningFolders/friends.svg";
import generated from "../../../public/learningFolders/generated.svg";
// import prebuilt from "../../../public/learningFolders/prebuilt.svg";
import { useProfile } from "../../hooks/useProfile";
import { getIndustryName } from "../../hooks/useUserPreferences";
import DocumentDrawer from "../drawers/DocumentDrawer";

export default function LearnJargon() {
    const navigate = useNavigate();
    const { data: profile } = useProfile();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const industryName = getIndustryName(profile?.industryId);

    return (
        <div className='container'>
            <div className='learningOverview'>
                <div className='learningOverviewHeader'>
                    <div className='headerContent'>
                        <h1>
                            <span className='badge'>{industryName}</span>
                            My Courses
                        </h1>
                        <p>
                            Let’s learn and get some badges today! Who knows
                            maybe we’ll even get on the leaderboard this week...
                        </p>
                    </div>
                    <img
                        src={rockyWink}
                        alt='Happy Rocky'
                    />
                </div>

                <DocumentDrawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                />

                <div className='lessonFolders'>
                    <div className='prebuilt'>
                        <NavigationCard
                            title=''
                            description=''
                            cardType='industry'
                            industryName={industryName}
                            buttonText={`${industryName} Course`}
                            onClick={() =>
                                navigate("/learning/existing/levels")
                            }
                        />
                    </div>


                    <img
                        className='generated'
                        src={generated}
                        alt='Custom Lessons'
                        onClick={() => navigate("/learning/custom/categories")}
                    />

                    <img
                        className='friends'
                        src={friends}
                        alt='Custom Lessons'
                        onClick={() => navigate("/learning/shared")}
                    />
                </div>

                {/* <NavigationCard
          title=""
          description=""
          cardType="generated"
          buttonText="View Lessons"
          onClick={() => navigate("/learning/custom/categories")}
        /> */}

                {/* <NavigationCard
          title=""
          description=""
          cardType="friends"
          buttonText="Friend's Lessons"
          onClick={() => navigate("/learning/shared")}
        /> */}
            </div>
        </div>
    );
}
