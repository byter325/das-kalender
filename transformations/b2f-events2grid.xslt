<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" />
	<xsl:template match="/">
		<xsl:apply-templates select="events/event">
			<xsl:sort select="start" order="ascending" />
		</xsl:apply-templates>
	</xsl:template>

	<xsl:template match="event">
		<xsl:variable name="duration" select="(xs:dayTimeDuration(xs:dateTime(end)-xs:dateTime(start)) div xs:dayTimeDuration('PT1S')) div 60" />
		<xsl:variable name="startMinute" select="number(format-dateTime(start,'[m]'))" />
		<xsl:variable name="startHour" select="number(format-dateTime(start,'[H]'))" />
		<xsl:variable name="startDay" select="format-dateTime(start,'[Fn]')" />
		<div class="kalenderitem ki-colspan-4 ki-day-{$startDay} ki-hour-{format-number($startHour,'#')}{format-number($startMinute - ($startMinute mod 15),'00')} ki-duration-{$duration - ($duration mod 15)}" data-uid="{uid}" data-day="{$startDay}" data-colspan="4" data-duration="{$duration}" data-starthour="{$startHour}" data-startminute="{$startMinute}">
			<span class="fw-bold" data-bs-toggle="tooltip" data-bs-placement="left">
				<xsl:attribute name="title">
					<xsl:value-of select="description" />
				</xsl:attribute>
				<xsl:value-of select="title" />
			</span>
			<br />
			<xsl:value-of select="category" />
			<br />
			<span data-bs-toggle="tooltip" data-bs-placement="left">
				<xsl:attribute name="title">
					<xsl:value-of select="format-dateTime(start,'[D].[M].[Y], [H]:[m]')" />
				</xsl:attribute>
				<i class="bi bi-clock-fill me-1" />
				<xsl:value-of select="format-dateTime(start,'[D].[M].[Y]')" />
				,
				<xsl:value-of select="format-dateTime(start,'[H]:[m]')" />
				-
				<xsl:value-of select="format-dateTime(end,'[H]:[m]')" />
			</span>
			<br />

			<span data-bs-toggle="tooltip" data-bs-placement="left">
				<xsl:attribute name="title">
					<xsl:value-of select="location" />
				</xsl:attribute>
				<i class="bi bi-geo-alt-fill me-1" />
				<xsl:value-of select="location" />
			</span>
			<br />
			<xsl:if test="presenters/presenter">
				<span data-bs-toggle="tooltip" data-bs-placement="left">
					<xsl:attribute name="title">
						<xsl:value-of select="presenters/presenter/lastName" />
					</xsl:attribute>
					<i class=" bi bi-person-square me-1" />
					<xsl:value-of select="presenters/presenter/lastName" />
				</span>
			</xsl:if>
		</div>
	</xsl:template>
</xsl:stylesheet>