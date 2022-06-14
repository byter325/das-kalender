<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <events>
            <xsl:for-each select="events/event">
                <event>
                    <uid>
                        <xsl:value-of select="uid"/>
                    </uid>
                    <title>
                        <xsl:value-of select="summary"/>
                    </title>
                    <description>
                        <xsl:value-of select="description"/>
                    </description>
                    <presenters>
                        <xsl:for-each select="attendee">
                            <presenter>
                                <firstName>
                                    <xsl:value-of select="replace(params/CN,'&quot;.+,\s(.+)&quot;','$1')"/>
                                </firstName>
                                <lastName>
                                    <xsl:value-of select="replace(params/CN,'&quot;(.+),\s.+&quot;','$1')"/>
                                </lastName>
                                <initials>
                                    <xsl:value-of select="replace(params/CN,'&quot;(.).+,\s(.).+&quot;','$2$1')"/>
                                </initials>
                                <mail>
                                    <xsl:value-of select="replace(val,'MAILTO:','')"/>
                                </mail>
                            </presenter>
                        </xsl:for-each>
                    </presenters>
                    <category>
                        <xsl:value-of select="categories"/>
                    </category>
                    <participant>
                        <uid></uid>
                        <name></name>
                    </participant>
                    <start>
                        <xsl:value-of select="start"/>
                    </start>
                    <end>
                        <xsl:value-of select="end"/>
                    </end>
                    <location>
                        <xsl:value-of select="location"/>
                    </location>
                    <modified>
                        <xsl:value-of select="lastmodified"/>
                    </modified>
                    <modifiedBy>
                        <firstName></firstName>
                        <lastName></lastName>
                        <initials></initials>
                        <mail></mail>
                    </modifiedBy>
                </event>
            </xsl:for-each>
        </events>
    </xsl:template>
</xsl:stylesheet>