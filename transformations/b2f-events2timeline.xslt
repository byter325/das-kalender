<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" />
	<xsl:template match="/">
		<article id="timelines">
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'monday'" />
				<xsl:with-param name="weekdayD" select="'Montag'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'tuesday'" />
				<xsl:with-param name="weekdayD" select="'Dienstag'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'wednesday'" />
				<xsl:with-param name="weekdayD" select="'Mittwoch'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'thursday'" />
				<xsl:with-param name="weekdayD" select="'Donnerstag'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'friday'" />
				<xsl:with-param name="weekdayD" select="'Freitag'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'saturday'" />
				<xsl:with-param name="weekdayD" select="'Samstag'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
			<xsl:call-template name="printweekday">
				<xsl:with-param name="weekdayE" select="'sunday'" />
				<xsl:with-param name="weekdayD" select="'Sonntag'" />
				<xsl:with-param name="events" select="events" />
			</xsl:call-template>
		</article>
	</xsl:template>
	<xsl:template name="printweekday">
		<xsl:param name="weekdayE" />
		<xsl:param name="weekdayD" />
		<xsl:param name="events" />
		<h3>
			<a href="#{$weekdayE}" class="link-secondary" data-bs-toggle="collapse">
				<xsl:value-of select="$weekdayD" />
				<i class="bi bi-caret-down-fill"></i>
			</a>
		</h3>
		<div class="collapse" id="{$weekdayE}">
			<ul class="timeline-with-icons py-2 mx-3">
				<xsl:apply-templates select="$events/event">
					<xsl:with-param name="weekday" select="$weekdayE" />
					<xsl:sort select="start" order="ascending" />
				</xsl:apply-templates>
			</ul>
		</div>
		<hr />
	</xsl:template>
	<xsl:template match="event">
		<xsl:param name="weekday" />
		<xsl:variable name="startDay" select="format-dateTime(start,'[Fn]')" />
		<xsl:if test="$startDay=$weekday">
			<xsl:variable name="duration" select="(xs:dayTimeDuration(xs:dateTime(end)-xs:dateTime(start)) div xs:dayTimeDuration('PT1S') div 60)" />
			<xsl:variable name="startMinute" select="number(format-dateTime(start,'[m]'))" />
			<xsl:variable name="startHour" select="number(format-dateTime(start,'[H]'))" />
			<li class="timeline-item mb-4 mt-3">
				<xsl:attribute name="title">
					<xsl:value-of select="category" />
					<xsl:text disable-output-escaping="yes">&#13;</xsl:text>
					<xsl:value-of select="description" />
					<xsl:if test="presenters/presenter">
						<xsl:text disable-output-escaping="yes">&#13;</xsl:text>
						<xsl:value-of select="concat(presenters/presenter/lastName,' (',presenters/presenter/mail,')')" />
					</xsl:if>
				</xsl:attribute>
				<span class="timeline-icon">
					<i class="bi bi-book"></i>
				</span>
				<h6 class="fw-bold d-inline">
					<xsl:value-of select="title" />
				</h6>
				<xsl:if test="(category != 'Lehrveranstaltung') and (category != 'Prüfung')">
					<div class="btn-group float-end">
						<button class="btn btn-outline-secondary btn-sm" title="Bearbeiten" data-bs-toggle="modal" data-bs-target="#editEvent" onclick="editEvent('{uid}')">
							<i class="bi bi-pencil-fill"></i>
						</button>
						<button class="btn btn-outline-secondary btn-sm" title="Löschen" data-bs-toggle="modal" data-bs-target="#deleteEvent" onclick="deleteEvent('{uid}')">
							<i class="bi bi-trash-fill"></i>
						</button>
					</div>
				</xsl:if>
				<p class="text-muted mb-1 fw-bold">
					<xsl:value-of select="concat(format-dateTime(start,'[D].[M].[Y], [H]:[m]'),' - ', format-dateTime(end,'[H]:[m]'))" />
					<span class="ms-2">
						<xsl:value-of select="concat('(',$duration,' min)')" />
					</span>
				</p>
				<i class="bi bi-geo-alt-fill me-1"></i>
				<xsl:value-of select="location" />
				<br />
				<xsl:if test="presenters/presenter">
					<i class=" bi bi-person-square me-1" />
					<xsl:value-of select="presenters/presenter/lastName" />
				</xsl:if>
			</li>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>