import { useLayoutEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useSelector } from "react-redux";
// @ts-ignore
import TurkeySvg from "../assets/turkey.svg?react";
import "../style/turkeyMap.css";
import type { RootState } from "../store/store";

interface TurkeyMapProps {
	onCityClick: (city: any) => void;
}

export default function TurkeyMap({ onCityClick }: TurkeyMapProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const cities = useSelector((state: RootState) => state.cities.items);

	useLayoutEffect(() => {
		const applyVisitedColors = () => {
			const svg = containerRef.current?.querySelector("svg");
			if (!svg) return;

			const normalizeCode = (value: string | null | undefined) => {
				const trimmed = value?.trim();
				if (!trimmed) return null;
				const normalized = trimmed.padStart(2, "0");
				return normalized === "34" ? "34" : normalized;
			};

			const visitedCodes = new Set<string>();
			cities.forEach((city) => {
				const normalizedCode = normalizeCode(String(city.code));
				if (city.visited && normalizedCode) {
					visitedCodes.add(normalizedCode);
				}
			});

			const randomColor = () => {
				const hue = Math.floor(Math.random() * 360);
				return `hsl(${hue} 85% 65%)`;
			};

			svg.querySelectorAll<SVGGElement>("g[data-city-name]").forEach((cityGroup) => {
				const code = normalizeCode(cityGroup.getAttribute("data-city-code"));
				const nestedCode = normalizeCode(
					cityGroup.querySelector<SVGGElement>("g[data-city-code]")?.getAttribute("data-city-code")
				);
				const resolvedCode = code ?? nestedCode;
				const shapes = cityGroup.querySelectorAll<SVGElement>("path, polygon, rect, circle");

				shapes.forEach((shape) => {
					shape.removeAttribute("fill");
					shape.removeAttribute("style");
				});

				if (!resolvedCode || !visitedCodes.has(resolvedCode)) return;

				const color = randomColor();
				shapes.forEach((shape) => {
					shape.setAttribute("fill", color);
					shape.setAttribute("style", `fill: ${color}; stroke: none;`);
				});
			});

			if (visitedCodes.has("34")) {
				const istanbulGroup = svg.querySelector<SVGGElement>('g[id="istanbul"]');
				if (istanbulGroup) {
					const color = randomColor();
					istanbulGroup.querySelectorAll<SVGElement>("path, polygon, rect, circle").forEach((shape) => {
						shape.removeAttribute("fill");
						shape.removeAttribute("style");
						shape.setAttribute("fill", color);
						shape.setAttribute("style", `fill: ${color}; stroke: none;`);
					});
				}
			}
		};

		requestAnimationFrame(applyVisitedColors);
	}, [cities]);

	const handleClick = (e: MouseEvent<SVGSVGElement>) => {
		const city = (e.target as Element).closest(
			"g[data-city-name]"
		) as SVGGElement | null;
		if (!city) return;
		onCityClick(city);
	};

	return (
		<div ref={containerRef}>
			<TurkeySvg
				className="turkeyMap"
				onClick={handleClick}
			/>
		</div>
	);
}