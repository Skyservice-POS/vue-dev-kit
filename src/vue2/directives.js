import { VBTooltip } from 'bootstrap-vue';

/**
 * `v-sky-tooltip` — директивна форма підказки.
 * У міграції вона потрібніша за компонентну: місця виклику здебільшого
 * вішають підказку прямо на елемент.
 *
 *   <button v-sky-tooltip="'Текст'">
 *   <button v-sky-tooltip.top="'Текст'">
 */
export const SkyTooltip = VBTooltip;

export const directives = { SkyTooltip };
