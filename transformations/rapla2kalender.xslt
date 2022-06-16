<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:kalender="http://localhost">
	<xsl:template match="/">
		<events>
			<xsl:for-each select="events/event">
				<event>
					<uid>
						<xsl:value-of select="uid" />
					</uid>
					<title>
						<xsl:value-of select="summary" />
					</title>
					<description>
						<xsl:value-of select="description" />
					</description>
					<presenters>
						<xsl:for-each select="attendee">
							<presenter>
								<firstName>
									<xsl:value-of select="replace(params/CN,'&quot;.+,\s(.+)&quot;','$1')" />
								</firstName>
								<lastName>
									<xsl:value-of select="replace(params/CN,'&quot;(.+),\s.+&quot;','$1')" />
								</lastName>
								<initials>
									<xsl:value-of select="replace(params/CN,'&quot;(.).+,\s(.).+&quot;','$2.$1.')" />
								</initials>
								<mail>
									<xsl:value-of select="replace(val,'MAILTO:','')" />
								</mail>
							</presenter>
						</xsl:for-each>
					</presenters>
					<category>
						<xsl:value-of select="categories" />
					</category>
					<participant>
						<uid></uid>
						<name></name>
					</participant>
					<start>
						<xsl:value-of select="kalender:adjustToTimezone(start)" />
					</start>
					<end>
						<xsl:value-of select="kalender:adjustToTimezone(end)" />
					</end>
					<location>
						<xsl:value-of select="location" />
					</location>
					<modified>
						<xsl:value-of select="lastmodified" />
					</modified>
					<modifiedBy>
						<firstName></firstName>
						<lastName></lastName>
						<initials></initials>
						<mail></mail>
					</modifiedBy>
				</event>
				<xsl:if test="number(rrule/options/count) &gt; 2">
					<xsl:variable name="count" select="xs:integer(number(rrule/options/count))" />
					<xsl:variable name="freq" select="xs:integer(number(rrule/options/freq))" />
					<xsl:variable name="interval" select="xs:integer(number(rrule/options/interval))" />
					<xsl:variable name="dtstart" select="xs:dateTime(rrule/options/dtstart)" />
					<xsl:variable name="end" select="xs:dateTime(end)" />
					<xsl:variable name="summary" select="summary" />
					<xsl:variable name="description" select="description" />
					<xsl:variable name="categories" select="categories" />
					<xsl:variable name="location" select="location" />
					<xsl:variable name="lastmodified" select="lastmodified" />
					<xsl:variable name="attendee" select="attendee" />
					<xsl:variable name="uid" select="uid" />
					<xsl:if test="$freq = 2">
						<xsl:for-each select="2 to $count">
							<xsl:variable name="days" select=". * $interval * 7" />
							<event>
								<uid>
									<xsl:value-of select="concat($uid,'-',.)" />
								</uid>
								<title>
									<xsl:value-of select="$summary" />
								</title>
								<description>
									<xsl:value-of select="$description" />
								</description>
								<presenters>
									<xsl:for-each select="$attendee">
										<presenter>
											<firstName>
												<xsl:value-of select="replace(params/CN,'&quot;.+,\s(.+)&quot;','$1')" />
											</firstName>
											<lastName>
												<xsl:value-of select="replace(params/CN,'&quot;(.+),\s.+&quot;','$1')" />
											</lastName>
											<initials>
												<xsl:value-of select="replace(params/CN,'&quot;(.).+,\s(.).+&quot;','$2.$1.')" />
											</initials>
											<mail>
												<xsl:value-of select="replace(val,'MAILTO:','')" />
											</mail>
										</presenter>
									</xsl:for-each>
								</presenters>
								<category>
									<xsl:value-of select="$categories" />
								</category>
								<participant>
									<uid></uid>
									<name></name>
								</participant>
								<start>
									<xsl:value-of select="kalender:adjustToTimezone($dtstart + xs:dayTimeDuration(concat('P',$days,'D')))" />
								</start>
								<end>
									<xsl:value-of select="kalender:adjustToTimezone($end + xs:dayTimeDuration(concat('P',$days,'D')))" />
								</end>
								<location>
									<xsl:value-of select="$location" />
								</location>
								<modified>
									<xsl:value-of select="$lastmodified" />
								</modified>
								<modifiedBy>
									<firstName></firstName>
									<lastName></lastName>
									<initials></initials>
									<mail></mail>
								</modifiedBy>
							</event>
						</xsl:for-each>
					</xsl:if>
				</xsl:if>
			</xsl:for-each>
		</events>
	</xsl:template>
	<xsl:function name="kalender:adjustToTimezone">
		<xsl:param name="datetime" as="xs:dateTime" />
		<xsl:choose>
			<xsl:when test="number(format-dateTime($datetime,'[M]')) &gt; 3 and number(format-dateTime($datetime,'[M]')) &lt; 11">
				<xsl:value-of select="adjust-dateTime-to-timezone($datetime,xs:dayTimeDuration('PT2H'))" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="adjust-dateTime-to-timezone($datetime,xs:dayTimeDuration('PT1H'))" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:function>
</xsl:stylesheet>