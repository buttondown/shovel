import DomainIcon from "@/components/DomainIcon";
import Grid from "@/components/Grid";
import SectionHeader from "@/components/SectionHeader";
import { REGISTRY as AFFILIATIONS_REGISTRY } from "@/lib/affiliations/registry";
import fetch from "@/lib/data";
import { reify } from "@/lib/db/domains";
import { GENRE_REGISTRY, REGISTRY } from "@/lib/services";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
	params: { domain: string };
};

const SOCIAL_MEDIA_URL_TEMPLATES: { [key: string]: string } = {
	twitter: "https://twitter.com/",
	linkedin: "https://linkedin.com/in/",
	facebook: "https://facebook.com/",
	instagram: "https://instagram.com/",
	youtube: "https://youtube.com/",
	tiktok: "https://tiktok.com/@",
	bluesky: "https://bsky.social/",
	github: "https://github.com/",
};

const generateURLForSocialMedia = (
	service: string,
	username: string,
): string => {
	const template = SOCIAL_MEDIA_URL_TEMPLATES[service];
	return template ? `${template}${username}` : "";
};

export async function generateMetadata(
	{ params }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	return {
		title: `${params.domain} - shovel.report`,
		description: `Information about ${params.domain} and its DNS records, technologies, social media and more.`,
		alternates: {
			canonical: `/domain/${params.domain}`,
		},
	};
}

function formatJson(json: string) {
	try {
		return {
			valid: true,
			value: JSON.stringify(JSON.parse(json || "{}"), null, 2),
		};
	} catch {
		return { valid: false, value: json };
	}
}

export default async function Page({
	params,
}: {
	params: {
		domain: string;
	};
}) {
	const data = await fetch(params.domain);
	if (!process.env.DISABLE_DATABASE) {
		await reify(params.domain, data);
	}

	const jsonld = data.detected_technologies.find(
		(datum) => datum.identifier === "jsonld",
	)?.metadata.value;
	const formattedJsonLd = formatJson(jsonld ?? "{}");

	return (
		<div className="">
			<h1>
				<a
					href={`https://${params.domain}`}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 hover:bg-white/20 transition-colors font-black text-xl"
				>
					<DomainIcon domain={params.domain} />
					<span>{params.domain}</span>
				</a>
			</h1>
			<SectionHeader>DNS Records</SectionHeader>
			<table className="">
				<tbody>
					{data.data
						.filter((datum) => datum.label === "DNS")
						.flatMap((datum) =>
							datum.data.map((record) => (
								<tr key={record.value}>
									<td className="pr-4">{record.type}</td>
									<td className="">{record.value}</td>
								</tr>
							)),
						)}
				</tbody>
			</table>
			<Grid.Container title="Affiliations">
				{data.detected_technologies
					.filter((datum) => datum.identifier in AFFILIATIONS_REGISTRY)
					.map((affiliation, i) => (
						<Grid.Item
							key={affiliation.identifier}
							domain={AFFILIATIONS_REGISTRY[affiliation.identifier].domain}
							url={`/affiliation/${affiliation.identifier}`}
						>
							{AFFILIATIONS_REGISTRY[affiliation.identifier].name}
						</Grid.Item>
					))}
			</Grid.Container>
			<Grid.Container title="Subdomains">
				{data.detected_technologies
					.filter((datum) => datum.identifier === "subdomain")
					.map((note, i) => (
						<Grid.Item
							key={note.metadata.value}
							url={`/domain/${note.metadata.value}`}
						>
							{note.metadata.value}
						</Grid.Item>
					))}
			</Grid.Container>
			<Grid.Container title="Services">
				{data.detected_technologies
					.filter((datum) => datum.identifier !== "subdomain")
					.filter((note) => REGISTRY[note.identifier])
					.map((note, i) => (
						<Grid.Item
							key={note.identifier}
							url={`/technology/${note.identifier}`}
							domain={new URL(REGISTRY[note.identifier]?.url).hostname}
						>
							<div>{REGISTRY[note.identifier]?.name}</div>
							<div className="text-gray-400 text-sm">
								{GENRE_REGISTRY[REGISTRY[note.identifier]?.genre].name}
							</div>
						</Grid.Item>
					))}
			</Grid.Container>
			<Grid.Container title="Social media">
				{data.detected_technologies
					.filter((note) => REGISTRY[note.identifier]?.genre === "social_media")
					.map((note, i) => (
						<Grid.Item
							key={note.identifier}
							url={generateURLForSocialMedia(
								note.identifier,
								note.metadata.username,
							)}
							domain={new URL(REGISTRY[note.identifier]?.url).hostname}
						>
							<div>{note.metadata.username}</div>
							<div className="text-gray-400 text-sm">
								{REGISTRY[note.identifier]?.name}
							</div>
						</Grid.Item>
					))}
			</Grid.Container>
			{jsonld && (
				<>
					<SectionHeader>JSON+LD</SectionHeader>
					<pre className="whitespace-pre max-w-full overflow-x-scroll">
						{formattedJsonLd.value}
					</pre>
					{!formattedJsonLd.valid && <p>(this JSON isn&apos;t valid)</p>}
				</>
			)}
		</div>
	);
}
