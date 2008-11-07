require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe DirectoriesController do
  describe "route generation" do
    it "should map #index" do
      route_for(:controller => "directories", :action => "index").should == "/directories"
    end
  
    it "should map #new" do
      route_for(:controller => "directories", :action => "new").should == "/directories/new"
    end
  
    it "should map #show" do
      route_for(:controller => "directories", :action => "show", :id => 1).should == "/directories/1"
    end
  
    it "should map #edit" do
      route_for(:controller => "directories", :action => "edit", :id => 1).should == "/directories/1/edit"
    end
  
    it "should map #update" do
      route_for(:controller => "directories", :action => "update", :id => 1).should == "/directories/1"
    end
  
    it "should map #destroy" do
      route_for(:controller => "directories", :action => "destroy", :id => 1).should == "/directories/1"
    end
  end

  describe "route recognition" do
    it "should generate params for #index" do
      params_from(:get, "/directories").should == {:controller => "directories", :action => "index"}
    end
  
    it "should generate params for #new" do
      params_from(:get, "/directories/new").should == {:controller => "directories", :action => "new"}
    end
  
    it "should generate params for #create" do
      params_from(:post, "/directories").should == {:controller => "directories", :action => "create"}
    end
  
    it "should generate params for #show" do
      params_from(:get, "/directories/1").should == {:controller => "directories", :action => "show", :id => "1"}
    end
  
    it "should generate params for #edit" do
      params_from(:get, "/directories/1/edit").should == {:controller => "directories", :action => "edit", :id => "1"}
    end
  
    it "should generate params for #update" do
      params_from(:put, "/directories/1").should == {:controller => "directories", :action => "update", :id => "1"}
    end
  
    it "should generate params for #destroy" do
      params_from(:delete, "/directories/1").should == {:controller => "directories", :action => "destroy", :id => "1"}
    end
  end
end
