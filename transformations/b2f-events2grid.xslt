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
			<xsl:attribute name="title">
				<xsl:value-of select="category" />
				<xsl:text disable-output-escaping="yes">&#13;</xsl:text>
				<xsl:value-of select="description" />
				<xsl:if test="presenters/presenter">
					<xsl:text disable-output-escaping="yes">&#13;</xsl:text>
					<xsl:value-of select="concat(presenters/presenter/lastName,' (',presenters/presenter/mail,')')" />
				</xsl:if>
			</xsl:attribute>
			<span class="eventHeading">
				<xsl:value-of select="title" />
			</span>
			<br />
			<i class="bi bi-clock-fill me-1" />
			<xsl:value-of select="format-dateTime(start,'[D].[M].[Y]')" />
			,
			<xsl:value-of select="format-dateTime(start,'[H]:[m]')" />
			-
			<xsl:value-of select="format-dateTime(end,'[H]:[m]')" />
			<br />
			<i class="bi bi-geo-alt-fill me-1" />
			<xsl:value-of select="location" />
			<br />
			<xsl:if test="presenters/presenter">
				<i class=" bi bi-person-square me-1" />
				<xsl:value-of select="presenters/presenter/lastName" />
			</xsl:if>
		</div>
	</xsl:template>
</xsl:stylesheet>