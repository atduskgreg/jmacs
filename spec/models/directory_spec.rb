require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Directory#entries_glob" do
  it "should correctly convert a path without a trailing slash" do
    d = Directory.new :path => "/Users/greg/code"
    d.entries_glob.should == "/Users/greg/code/*"
  end
  it "should correctly convert a path with a trailing slash" do
    d = Directory.new :path => "/Users/greg/code/"
    d.entries_glob.should == "/Users/greg/code/*"
  end
end
