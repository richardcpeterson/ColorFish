XULVER = 1.9.1.3
NSISVER = 2.45
NSIS = nsis-$(NSISVER)
NSISDIR = nsis/
APPNAME = csschemer
APPVER = alpha-0.1
DISTRO_DIR = distros/

APP_DIRECTORIES = chrome defaults extensions testpages updates

XUL_SOURCE_SITE = http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/$(XULVER)/runtimes/
XUL_SOURCE_DIR = xul-sources/

BUILDS = css-linux css-windows css-mac

LINUX_DIR = linux/
LINUX_FINAL_DIR = $(DISTRO_DIR)$(LINUX_DIR)$(APPNAME)/
LINUX_FINAL_FILE = $(APPNAME)-$(APPVER).tar.gz
LINUX_XUL_FILE = xulrunner-$(XULVER).en-US.linux-i686.tar.bz2

WINDOWS_DIR = windows/
WINDOWS_FINAL_DIR = $(DISTRO_DIR)$(WINDOWS_DIR)$(APPNAME)/
WINDOWS_FINAL_FILE = $(APPNAME)-$(APPVER).exe
WINDOWS_NSIS_SCRIPT = $(APPNAME)-$(APPVER).nsi
WINDOWS_XUL_FILE = xulrunner-$(XULVER).en-US.win32.zip

MAC_DIR = mac/
MAC_FINAL_DIR = $(DISTRO_DIR)$(MAC_DIR)$(APPNAME)/
MAC_FINAL_FILE = temp
MAC_XUL_FILE = xulrunner-$(XULVER).en-US.mac-pkg.dmg

XUL_FILES = $(XUL_SOURCE_DIR)$(LINUX_XUL_FILE) $(XUL_SOURCE_DIR)$(WINDOWS_XUL_FILE) $(XUL_SOURCE_DIR)$(MAC_XUL_FILE)
XUL_SOURCE_DIRS = $(XUL_SOURCE_DIR)$(LINUX_DIR) $(XUL_SOURCE_DIR)$(WINDOWS_DIR) $(XUL_SOURCE_DIR)$(MAC_DIR)

all : $(XUL_SOURCE_DIR) $(XUL_SOURCE_DIRS) $(BUILDS)

nsis : $(NSISDIR)$(NSIS)/makensis

clean :
	rm $(DISTRO_DIR) -rf
	rm $(NSISDIR) -rf
	rm $(XUL_SOURCE_DIR) -rf

$(NSISDIR)$(NSIS)-src.tar.bz2 :
	wget http://sourceforge.net/projects/nsis/files/NSIS%202/$(NSISVER)/$(NSIS)-src.tar.bz2/download --directory-prefix=$(NSISDIR)

$(NSISDIR)$(NSIS).zip :
	wget http://sourceforge.net/projects/nsis/files/NSIS%202/$(NSISVER)/$(NSIS).zip/download --directory-prefix=$(NSISDIR)

$(NSISDIR)$(NSIS)-src/ : $(NSISDIR)$(NSIS)-src.tar.bz2
	tar -xjvf $(NSISDIR)$(NSIS)-src.tar.bz2 --directory $(NSISDIR)

$(NSISDIR)$(NSIS)/ : $(NSISDIR)$(NSIS).zip
	unzip $(NSISDIR)$(NSIS).zip -d $(NSISDIR)

$(NSISDIR)$(NSIS)/makensis : $(NSISDIR)$(NSIS)-src/ $(NSISDIR)$(NSIS)/
	cd "$(NSISDIR)$(NSIS)-src" ;\
	scons SKIPSTUBS=all SKIPPLUGINS=all SKIPUTILS=all SKIPMISC=all NSIS_CONFIG_CONST_DATA=no PREFIX=../$(NSIS) install-compiler
	cp $(NSISDIR)$(NSIS)/bin/makensis $(NSISDIR)$(NSIS)

$(NSISDIR)$(NSIS)/share/nsis : $(NSISDIR)$(NSIS)/share
	ln -s ../ $(NSISDIR)$(NSIS)/share/nsis

$(NSISDIR)$(NSIS)/share :
	cd "$(NSISDIR)$(NSIS)" ;\
	mkdir share

css-linux : $(LINUX_FINAL_DIR)$(LINUX_FINAL_FILE)
	rm $(LINUX_FINAL_DIR) -rf
	rm $(XUL_SOURCE_DIR)$(LINUX_DIR) -rf

css-windows : $(WINDOWS_FINAL_DIR)$(WINDOWS_FINAL_FILE)
	rm $(WINDOWS_FINAL_DIR) -rf
	rm $(XUL_SOURCE_DIR)$(WINDOWS_DIR) -rf

css-mac :

$(LINUX_FINAL_DIR)$(LINUX_FINAL_FILE) : $(LINUX_FINAL_DIR)
	cp ../application.ini $(LINUX_FINAL_DIR)
	for directory in $(APP_DIRECTORIES); do \
		cp ../$$directory $(LINUX_FINAL_DIR). -rf ; \
	done
	cp $(XUL_SOURCE_DIR)$(LINUX_DIR)xulrunner-stub $(LINUX_FINAL_DIR).
	mv $(LINUX_FINAL_DIR)xulrunner-stub $(LINUX_FINAL_DIR)$(APPNAME)
	mkdir $(LINUX_FINAL_DIR)xulrunner
	cp $(XUL_SOURCE_DIR)$(LINUX_DIR)* $(LINUX_FINAL_DIR)xulrunner/ -rf
	cd $(DISTRO_DIR)$(LINUX_DIR) ;\
	tar -cvzf $(LINUX_FINAL_FILE) $(APPNAME)

$(WINDOWS_FINAL_DIR)$(WINDOWS_FINAL_FILE) : $(WINDOWS_FINAL_DIR) nsis $(NSISDIR)$(NSIS)/$(WINDOWS_NSIS_SCRIPT) $(NSISDIR)$(NSIS)/share/nsis
	cd $(NSISDIR)$(NSIS) ;\
	./makensis $(WINDOWS_NSIS_SCRIPT)
	cp $(NSISDIR)$(NSIS)/$(WINDOWS_FINAL_FILE) $(DISTRO_DIR)$(WINDOWS_DIR)$(WINDOWS_FINAL_FILE)

$(NSISDIR)$(NSIS)/$(WINDOWS_NSIS_SCRIPT) : build-nsis-script
	cp $(WINDOWS_NSIS_SCRIPT) $(NSISDIR)$(NSIS)/$(WINDOWS_NSIS_SCRIPT)

build-nsis-script : setup-windows-files
	./build_nsi.sh $(APPNAME)-$(APPVER) $(WINDOWS_FINAL_DIR)

setup-windows-files :
	cp ../application.ini $(WINDOWS_FINAL_DIR)
	for directory in $(APP_DIRECTORIES); do\
		cp ../$$directory $(WINDOWS_FINAL_DIR). -rf ; \
	done
	cp $(XUL_SOURCE_DIR)$(WINDOWS_DIR)xulrunner-stub.exe $(WINDOWS_FINAL_DIR)
	mv $(WINDOWS_FINAL_DIR)xulrunner-stub.exe $(WINDOWS_FINAL_DIR)$(APPNAME).exe
	mkdir $(WINDOWS_FINAL_DIR)xulrunner
	cp $(XUL_SOURCE_DIR)$(WINDOWS_DIR)* $(WINDOWS_FINAL_DIR)xulrunner/ -rf

$(LINUX_FINAL_DIR) : $(DISTRO_DIR)$(LINUX_DIR)
	mkdir $(LINUX_FINAL_DIR)

$(WINDOWS_FINAL_DIR) : $(DISTRO_DIR)$(WINDOWS_DIR)
	mkdir $(WINDOWS_FINAL_DIR)

$(DISTRO_DIR) :
	mkdir $(DISTRO_DIR)

$(DISTRO_DIR)$(LINUX_DIR) : $(DISTRO_DIR)
	mkdir $(DISTRO_DIR)$(LINUX_DIR)

$(DISTRO_DIR)$(WINDOWS_DIR) : $(DISTRO_DIR)
	mkdir $(DISTRO_DIR)$(WINDOWS_DIR)

$(XUL_SOURCE_DIR) :
	mkdir $(XUL_SOURCE_DIR)

$(XUL_SOURCE_DIR)$(LINUX_DIR) : $(XUL_SOURCE_DIR)$(LINUX_XUL_FILE)
	cd $(XUL_SOURCE_DIR) ;\
	tar -xjvf $(LINUX_XUL_FILE) ;\
	mv xulrunner $(LINUX_DIR)

$(XUL_SOURCE_DIR)$(WINDOWS_DIR) : $(XUL_SOURCE_DIR)$(WINDOWS_XUL_FILE)
	cd $(XUL_SOURCE_DIR) ;\
	unzip $(WINDOWS_XUL_FILE) ;\
	mv xulrunner $(WINDOWS_DIR)

$(XUL_SOURCE_DIR)$(MAC_DIR) : $(XUL_SOURCE_DIR)$(MAC_XUL_FILE)

$(XUL_SOURCE_DIR)$(LINUX_XUL_FILE) :
	wget $(XUL_SOURCE_SITE)$(LINUX_XUL_FILE) \
	--directory-prefix=$(XUL_SOURCE_DIR)

$(XUL_SOURCE_DIR)$(WINDOWS_XUL_FILE) :
	wget $(XUL_SOURCE_SITE)$(WINDOWS_XUL_FILE) \
	--directory-prefix=$(XUL_SOURCE_DIR)

$(XUL_SOURCE_DIR)$(MAC_XUL_FILE) :
	wget $(XUL_SOURCE_SITE)$(MAC_XUL_FILE) \
	--directory-prefix=$(XUL_SOURCE_DIR)