import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { getPageDefinition } from "@/config/routes";
import { DesktopFeedPopUp } from "@/screens/DesktopFeedPopUp/DesktopFeedPopUp";
import { fetchAds, fetchFiltersCatalog, parseFiltersFromSearch } from "@/lib/ads";

const PAGE = getPageDefinition("feed-pop-up");

type FeedPopUpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FeedPopUpPage({ searchParams }: FeedPopUpPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const filters = parseFiltersFromSearch(resolvedSearchParams);
  const heroSex = filters.sex ?? "female";
  const heroIdentity = filters.identity ?? "cis";
  const resolvedFilters = { ...filters, profileType: undefined, sex: heroSex, identity: heroIdentity };
  const [catalog, heroResult] = await Promise.all([
    fetchFiltersCatalog(),
    fetchAds({ sex: heroSex, identity: heroIdentity, featured: true, limit: 3 }),
  ]);
  const featuredIds = heroResult.ads.map((ad) => ad.id);
  const weeklyResult = await fetchAds({
    sex: heroSex,
    identity: heroIdentity,
    weekly: true,
    featured: false,
    limit: 3,
    excludeIds: featuredIds,
  });
  const weeklyIds = weeklyResult.ads.map((ad) => ad.id);
  const adsResult = await fetchAds({
    ...resolvedFilters,
    featured: false,
    limit: 9,
    excludeIds: [...featuredIds, ...weeklyIds],
  });

  return (
    <>
      {PAGE && <PageHeader page={PAGE} />}
      <ScreenShell>
        <DesktopFeedPopUp
          ads={adsResult.ads}
          heroAds={heroResult.ads}
          weeklyAds={weeklyResult.ads}
          filtersCatalog={catalog}
          initialFilters={resolvedFilters}
          isMock={adsResult.isMock}
          pagination={{ page: adsResult.page, pages: adsResult.pages, total: adsResult.total, limit: adsResult.limit }}
          citySummary={adsResult.citySummary}
        />
      </ScreenShell>
    </>
  );
}
