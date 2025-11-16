import { useParams, useSearchParams, Link } from "react-router-dom";
import { useAvailableBadges } from "../../hooks/useAvailableBadges";
import { useMemo } from "react";
import LoadingBar from "@/components/LoadingBar";

const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

const BossPage = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const industryId = searchParams.get("industry_id");
  const { data: availableBadges, isLoading } = useAvailableBadges();

  const targetBadge = useMemo(() => {
    console.log('🔍 BossPage Debug:', {
      availableBadges: availableBadges?.length,
      levelId,
      industryId,
      parsedLevelId: levelId ? parseInt(levelId) : null,
      parsedIndustryId: industryId ? parseInt(industryId) : null,
    });

    if (availableBadges && levelId && industryId) {
      const found = availableBadges.find(
        (badge) => {
          const matches = badge.levelId === parseInt(levelId) &&
            badge.industryId === parseInt(industryId);
          if (matches) {
            console.log('✅ Found matching badge:', badge);
          }
          return matches;
        }
      );

      if (!found) {
        console.log('❌ No badge found. All badges:', availableBadges.map(b => ({
          code: b.code,
          levelId: b.levelId,
          industryId: b.industryId
        })));
      }

      return found || null;
    }
    return null;
  }, [availableBadges, levelId, industryId]);

  const badgeIconUrl = useMemo(() => {
    if (targetBadge?.iconUrl) {
      const iconPath = targetBadge.iconUrl;
      const fullPath = `../../assets/badges/${iconPath}`;
      const url = badgeModules[fullPath];
      if (url) {
        return url;
      } else {
        console.error('❌ Badge not in glob. Tried:', fullPath, 'Available:', Object.keys(badgeModules));
        return null;
      }
    }
    console.log('⚠️ No badge iconUrl found:', { targetBadge, availableBadges });
    return null;
  }, [targetBadge]);

  if (isLoading) {
    return (
      <div className="container">
        <LoadingBar isLoading={isLoading} text="Loading boss challenge" />
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Boss Challenge</h1>

      {badgeIconUrl && (
        <img src={badgeIconUrl} alt="Level Badge" />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link to={`/learning/existing/levels/${levelId}/terminology?industry_id=${industryId}`}>
          View All Terms
        </Link>

        <Link to={`/learning/existing/levels/${levelId}/terms?industry_id=${industryId}&all=true`}>
          Practice Flashcards
        </Link>

        <Link to={`/learning/existing/levels/${levelId}/quiz/take?quiz=3&industry_id=${industryId}`}>
          Start Boss Quiz
        </Link>
      </div>
    </div>
  );
};

export default BossPage;
