require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/documents/new.html.erb" do
  include DocumentsHelper
  
  before(:each) do
    assigns[:document] = stub_model(Document,
      :new_record? => true
    )
  end

  it "should render new form" do
    render "/documents/new.html.erb"
    
    response.should have_tag("form[action=?][method=post]", documents_path) do
    end
  end
end


