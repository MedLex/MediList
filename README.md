# MediList
List of used medication
This software loads a medication list from an apotheker's system. The apotheker system shows a QR code which is read and identifies:
1. The required action (only download for now)
2. The birthdate of the patient
3. The URL through which the list can be retrieved, including a temporary unique code for the pertaining list

The downloaded list is a JSON structured file, that only contains the list's date, the apotheker name and the medication list.
It does not contain any data that may connect the list to a particular individual.
