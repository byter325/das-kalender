<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:template match="/">
		<article id="timelines" style="display: block;">
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
				<xsl:for-each select="$events/event">
					<xsl:variable name="duration" select="(xs:dayTimeDuration(xs:dateTime(end)-xs:dateTime(start)) div xs:dayTimeDuration('PT1S') div 60)" />
					<xsl:variable name="startMinute" select="number(format-dateTime(start,'[m]'))" />
					<xsl:variable name="startHour" select="number(format-dateTime(start,'[H]'))" />
					<xsl:variable name="startDay" select="format-dateTime(start,'[Fn]')" />
					<xsl:if test="$startDay=$weekdayE">
						<li class="timeline-item mb-4 mt-3">
							<span class="timeline-icon">
								<i class="bi bi-book"></i>
							</span>
							<h6 class="fw-bold d-inline">
								<xsl:value-of select="title" />
							</h6>
							<p class="text-muted mb-1 fw-bold">
								<xsl:value-of select="format-dateTime(start,'[D].[M].[Y]')" />
								,
								<xsl:value-of select="format-dateTime(start,'[H]:[m]')" />
								-
								<xsl:value-of select="format-dateTime(end,'[H]:[m]')" />
								<span class="ms-2">
									(
									<xsl:value-of select="$duration" />
									min
									)
								</span>
							</p>
							<span class="text-muted mb-0" data-bs-toggle="tooltip" data-bs-placement="right" title="" data-bs-original-title="{location}">
								<i class="bi bi-geo-alt-fill me-1"></i>
								<xsl:value-of select="location" />
							</span>
							<br />
							<span class="text-muted mb-0" data-bs-toggle="tooltip" data-bs-placement="right" title="" data-bs-original-title="jr@test.example.com">
								<!-- <i class="bi bi-person-square me-1"></i>
								<xsl:if test="presenters/presenter">
									<xsl:value-of select="presenters/presenter/lastName" />
									,
									<xsl:value-of select="presenters/presenter/firstName" />
									(
									<xsl:value-of select="presenters/presenter/mail" />
									)
								</xsl:if> -->
							</span>
						</li>
					</xsl:if>
				</xsl:for-each>
			</ul>
		</div>
		<hr />
	</xsl:template>
</xsl:stylesheet>