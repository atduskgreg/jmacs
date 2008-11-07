require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe DirectoriesController do

  def mock_directory(stubs={})
    @mock_directory ||= mock_model(Directory, stubs)
  end
  
  describe "responding to GET index" do

    it "should expose all directories as @directories" do
      Directory.should_receive(:find).with(:all).and_return([mock_directory])
      get :index
      assigns[:directories].should == [mock_directory]
    end

    describe "with mime type of xml" do
  
      it "should render all directories as xml" do
        request.env["HTTP_ACCEPT"] = "application/xml"
        Directory.should_receive(:find).with(:all).and_return(directories = mock("Array of Directories"))
        directories.should_receive(:to_xml).and_return("generated XML")
        get :index
        response.body.should == "generated XML"
      end
    
    end

  end

  describe "responding to GET show" do

    it "should expose the requested directory as @directory" do
      Directory.should_receive(:find).with("37").and_return(mock_directory)
      get :show, :id => "37"
      assigns[:directory].should equal(mock_directory)
    end
    
    describe "with mime type of xml" do

      it "should render the requested directory as xml" do
        request.env["HTTP_ACCEPT"] = "application/xml"
        Directory.should_receive(:find).with("37").and_return(mock_directory)
        mock_directory.should_receive(:to_xml).and_return("generated XML")
        get :show, :id => "37"
        response.body.should == "generated XML"
      end

    end
    
  end

  describe "responding to GET new" do
  
    it "should expose a new directory as @directory" do
      Directory.should_receive(:new).and_return(mock_directory)
      get :new
      assigns[:directory].should equal(mock_directory)
    end

  end

  describe "responding to GET edit" do
  
    it "should expose the requested directory as @directory" do
      Directory.should_receive(:find).with("37").and_return(mock_directory)
      get :edit, :id => "37"
      assigns[:directory].should equal(mock_directory)
    end

  end

  describe "responding to POST create" do

    describe "with valid params" do
      
      it "should expose a newly created directory as @directory" do
        Directory.should_receive(:new).with({'these' => 'params'}).and_return(mock_directory(:save => true))
        post :create, :directory => {:these => 'params'}
        assigns(:directory).should equal(mock_directory)
      end

      it "should redirect to the created directory" do
        Directory.stub!(:new).and_return(mock_directory(:save => true))
        post :create, :directory => {}
        response.should redirect_to(directory_url(mock_directory))
      end
      
    end
    
    describe "with invalid params" do

      it "should expose a newly created but unsaved directory as @directory" do
        Directory.stub!(:new).with({'these' => 'params'}).and_return(mock_directory(:save => false))
        post :create, :directory => {:these => 'params'}
        assigns(:directory).should equal(mock_directory)
      end

      it "should re-render the 'new' template" do
        Directory.stub!(:new).and_return(mock_directory(:save => false))
        post :create, :directory => {}
        response.should render_template('new')
      end
      
    end
    
  end

  describe "responding to PUT udpate" do

    describe "with valid params" do

      it "should update the requested directory" do
        Directory.should_receive(:find).with("37").and_return(mock_directory)
        mock_directory.should_receive(:update_attributes).with({'these' => 'params'})
        put :update, :id => "37", :directory => {:these => 'params'}
      end

      it "should expose the requested directory as @directory" do
        Directory.stub!(:find).and_return(mock_directory(:update_attributes => true))
        put :update, :id => "1"
        assigns(:directory).should equal(mock_directory)
      end

      it "should redirect to the directory" do
        Directory.stub!(:find).and_return(mock_directory(:update_attributes => true))
        put :update, :id => "1"
        response.should redirect_to(directory_url(mock_directory))
      end

    end
    
    describe "with invalid params" do

      it "should update the requested directory" do
        Directory.should_receive(:find).with("37").and_return(mock_directory)
        mock_directory.should_receive(:update_attributes).with({'these' => 'params'})
        put :update, :id => "37", :directory => {:these => 'params'}
      end

      it "should expose the directory as @directory" do
        Directory.stub!(:find).and_return(mock_directory(:update_attributes => false))
        put :update, :id => "1"
        assigns(:directory).should equal(mock_directory)
      end

      it "should re-render the 'edit' template" do
        Directory.stub!(:find).and_return(mock_directory(:update_attributes => false))
        put :update, :id => "1"
        response.should render_template('edit')
      end

    end

  end

  describe "responding to DELETE destroy" do

    it "should destroy the requested directory" do
      Directory.should_receive(:find).with("37").and_return(mock_directory)
      mock_directory.should_receive(:destroy)
      delete :destroy, :id => "37"
    end
  
    it "should redirect to the directories list" do
      Directory.stub!(:find).and_return(mock_directory(:destroy => true))
      delete :destroy, :id => "1"
      response.should redirect_to(directories_url)
    end

  end

end
