require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/directories/new.html.erb" do
  include DirectoriesHelper
  
  before(:each) do
    assigns[:directory] = stub_model(Directory,
      :new_record? => true
    )
  end

  it "should render new form" do
    render "/directories/new.html.erb"
    
    response.should have_tag("form[action=?][method=post]", directories_path) do
    end
  end
end


