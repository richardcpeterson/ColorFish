XULVER = 1.9.1.3
NSISVER = 2.45
NSIS = nsis-$(NSISVER)
NSISDIR = nsis/
APPNAME = csschemer
DISTRO_DIR = distros/
LINUX_DIR = linux/
LINUX_FINAL_DIR = $(DISTRO_DIR)$(LINUX_DIR)$(APPNAME)/

all : nsis css-linux

nsis : $(NSISDIR)$(NSIS)/makensis

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

css-linux : $(DISTRO_DIR)$(LINUX_DIR)$(APPNAME).tar.gz
	rm $(LINUX_FINAL_DIR) -rf

$(DISTRO_DIR)$(LINUX_DIR)$(APPNAME).tar.gz : $(LINUX_FINAL_DIR)
	cd $(DISTRO_DIR)$(LINUX_DIR) ;\
	tar -cvzf $(APPNAME).tar.gz $(APPNAME)

$(LINUX_FINAL_DIR) : distros xul-sources
	mkdir distros/$(LINUX_DIR)
	mkdir distros/$(LINUX_DIR)$(APPNAME)
	cp ../application.ini $(LINUX_FINAL_DIR)
#cp ../components $(LINUX_FINAL_DIR). -rf
	cp ../chrome $(LINUX_FINAL_DIR). -rf
	cp ../defaults $(LINUX_FINAL_DIR). -rf
	cp ../extensions $(LINUX_FINAL_DIR). -rf
	cp ../testpages $(LINUX_FINAL_DIR). -rf
	cp xul-sources/$(LINUX_DIR)xulrunner-stub $(LINUX_FINAL_DIR).
	mv $(LINUX_FINAL_DIR)xulrunner-stub $(LINUX_FINAL_DIR)$(APPNAME)
	mkdir $(LINUX_FINAL_DIR)xulrunner
	cp xul-sources/$(LINUX_DIR)* $(LINUX_FINAL_DIR)xulrunner/ -rf

distros :
	mkdir distros

xul-sources : xul-sources/xulrunner-$(XULVER).en-US.linux-i686.tar.bz2
	cd xul-sources/ ;\
	tar -xjvf xulrunner-$(XULVER).en-US.linux-i686.tar.bz2 ;\
	mv xulrunner $(LINUX_DIR)

xul-sources/xulrunner-$(XULVER).en-US.linux-i686.tar.bz2 :
	wget http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/$(XULVER)/runtimes/xulrunner-$(XULVER).en-US.linux-i686.tar.bz2 \
	--directory-prefix=xul-sources/
