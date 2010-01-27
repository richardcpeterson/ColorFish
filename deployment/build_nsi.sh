#!/bin/bash
#

APP_NAME=$1
APP_DIR=$2

rm "$APP_NAME".nsi

SCRIPT="# define the name of the installer
Name \"$APP_NAME\"

# file to write
outfile \"$APP_NAME.exe\"

# define the directory to install to
InstallDir \$PROGRAMFILES\\$APP_NAME

#The text to prompt the user to enter a directory
DirText \"This will install Csschemer on your computer. Choose a directory\"

# default section
section

setOutPath \$INSTDIR
File ../../${APP_DIR}application.ini
File ../../${APP_DIR}csschemer.exe

# define what to install and place it in the output path
"
CUR_DIR=$( pwd )

cd $APP_DIR

for dir in $( find . -type d | cut -d. -f2- ); do
    WIN_DIR=$( echo "$dir" | sed 's|/|\\|g' )
    SCRIPT="$SCRIPT setOutPath \$INSTDIR${WIN_DIR}
"
    for file in $( find ."$dir" -maxdepth 1 -type f | cut -d/ -f2- ); do
        SCRIPT="$SCRIPT File ../../$APP_DIR$file
"
    done
    SCRIPT="$SCRIPT

"
done

cd "$CUR_DIR"

SCRIPT="$SCRIPT

writeUninstaller \$INSTDIR\uninstaller.exe

# Create shortcuts
CreateDirectory \"\$SMPROGRAMS\\${APP_NAME}\"
CreateShortCut \"\$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk\" \"\$INSTDIR\csschemer.exe\"
CreateShortCut \"\$SMPROGRAMS\\${APP_NAME}\\Uninstall.lnk\" \"\$INSTDIR\uninstaller.exe\"

sectionEnd

# Create a sectioin to define what the uninstaller does.
section \"Uninstall\"

# Always delete uninstaller first
delete \$INSTDIR\uninstaller.exe

# delete the rest of the files

delete \$INSTDIR\application.ini
delete \$INSTDIR\csschemer.exe

delete \"\$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk\"
delete \"\$SMPROGRAMS\\${APP_NAME}\\Uninstall.lnk\"

"

CUR_DIR=$( pwd )

cd $APP_DIR
for dir in $( find . -type d -printf "%d %h/%f\n" | sort -nr | cut -d. -f2- ); do
    for file in $( find ."$dir" -maxdepth 1 -type f | cut -d/ -f2- ); do
        file=$( echo "$file" | sed 's|/|\\|g' )
        SCRIPT="$SCRIPT delete \$INSTDIR\\$file
"
    done
    dir=$( echo "$dir" | sed 's|/|\\|g' )
    SCRIPT="$SCRIPT RMDir \$INSTDIR${dir}\\
"
    SCRIPT="$SCRIPT

"
done

cd "$CUR_DIR"

SCRIPT="$SCRIPT

RMDir \$INSTDIR
RMDir \$SMPROGRAMS\\${APP_NAME}

sectionEnd"

echo "$SCRIPT" > "$APP_NAME".nsi
