require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/directories/edit.html.erb" do
  include DirectoriesHelper
  
  before(:each) do
    assigns[:directory] = @directory = stub_model(Directory,
      :new_record? => false
    )
  end

  it "should render edit form" do
    render "/directories/edit.html.erb"
    
    response.should have_tag("form[action=#{directory_path(@directory)}][method=post]") do
    end
  end
end


