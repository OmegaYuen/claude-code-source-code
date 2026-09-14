#!/usr/bin/osascript
-- Send one message into a WhatsApp group on this Mac by driving WhatsApp Desktop.
--
--   osascript send_whatsapp.applescript "Cleaning Team" "*CHECKED OUT · T2-22-2*\nGuest left at 11:52 AM."
--
-- Requires: WhatsApp (Mac App Store version) installed and logged in, and Accessibility
-- permission for the app running this script (Terminal / iTerm / Claude) under
-- System Settings → Privacy & Security → Accessibility.
--
-- How it works: open WhatsApp, focus the chat search (⌘F), type the group name, open the
-- first result, paste the message from the clipboard (paste keeps the line breaks), send.
-- "\n" in the message argument is turned into a real line break.

on run argv
	if (count of argv) < 2 then error "usage: send_whatsapp.applescript <group name> <message>"
	set groupName to item 1 of argv
	set msg to my replaceText(item 2 of argv, "\\n", linefeed)

	tell application "WhatsApp" to activate
	delay 1.2
	tell application "System Events"
		tell process "WhatsApp"
			set frontmost to true
			-- focus chat search and find the group
			keystroke "f" using {command down}
			delay 0.6
			keystroke "a" using {command down}
			keystroke groupName
			delay 1.4
			-- first result
			key code 125 -- down arrow
			delay 0.2
			key code 36 -- return
			delay 1.0
			-- paste the message into the composer and send
			set the clipboard to msg
			keystroke "v" using {command down}
			delay 0.6
			key code 36
			delay 0.6
		end tell
	end tell
	return "sent to " & groupName
end run

on replaceText(theText, searchStr, replaceStr)
	set AppleScript's text item delimiters to searchStr
	set parts to text items of theText
	set AppleScript's text item delimiters to replaceStr
	set theResult to parts as text
	set AppleScript's text item delimiters to ""
	return theResult
end replaceText
